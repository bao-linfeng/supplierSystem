<template>
    <div class="contract-module-wrap">
        <div class="contract-module-box">
            <div class="contract-module-head">
                <h3>{{lan[titleO[isEdit]+'合同']}}</h3>
                <img class="close" @click="close" src="../assets/close.svg" alt="">
            </div>
            <div class="contract-module-content">
                <div class="form-box">
                    <label class="label" for="">{{lan['合同编号']}}</label>
                    <input class="input" :class="{red: !parameter.contractNo}" type="text" v-model="parameter.contractNo" placeholder="" :disabled="isEdit == 3" />
                </div>
                <div class="form-box">
                    <label class="label" for="">{{lan['合同标题']}}</label>
                    <input class="input" :class="{red: !parameter.title}" type="text" v-model="parameter.title" placeholder="" :disabled="isEdit == 3" />
                </div>
                <div class="form-box">
                    <label class="label" for="">{{lan['合同金额']}}</label>
                    <SelectModule class="w80" :list="currencySignList" :defaultValue="parameter.currencySign" v-on:get-value="getCurrencySign" />
                    <input class="input w138" :class="{red: !parameter.amount}" type="text" v-model="parameter.amount" placeholder="" :disabled="isEdit == 3" />
                </div>
                <div class="form-box">
                    <label class="label" for="">{{lan['关联服务商']}}</label>
                    <el-select v-model="parameter.orgKey" :placeholder="lan['机构筛选']" :disabled="userRole >= 1 && userRole <= 3 ? false : true">
                        <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                    <!-- <SelectModule class="w218" :list="orgList" :defaultValue="parameter.orgKey" v-on:get-value="getValue" /> -->
                </div>
                <div class="form-box">
                    <label class="label" for="">{{lan['签订时间']}}</label>
                    <el-date-picker
                        v-model="parameter.signingTime"
                        type="date"
                        :disabled="isEdit == 3"
                    />
                </div>
                <div class="form-box">
                    <label class="label" for="">{{lan['截止时间']}}</label>
                    <el-date-picker
                        v-model="parameter.endTime"
                        type="date"
                        :disabled="isEdit == 3"
                    />
                </div>
                <div class="form-box">
                    <label class="label" for="">{{lan['合同概要']}}</label>
                    <textarea class="textarea" :class="{red: !parameter.content}" type="text" v-model="parameter.content" placeholder="" :disabled="isEdit == 3"></textarea>
                </div>
                <div class="form-box">
                    <label class="label" for="">{{lan['附件']}}</label>
                    <div class="file-box">
                        <div class="input-box">
                            <input v-if="isEdit >= 1 && isEdit <= 2" title="" class="upload-input" type="file" @change="loadFile" />
                            <i>{{lan['上传文件']}}</i>
                        </div>
                        <div class="download" v-for="(item, index) in enclosure" :key="index">
                            <a class="file" :href="item.url"  target="_blank" download>{{item.originalName}}</a>
                            <img v-if="isEdit >= 1 && isEdit <= 2" class="delete" @click="deleteFile(index)" src="../assets/close.svg" alt="">
                        </div>
                    </div>
                </div>
            </div>
            <div class="contract-module-foot" v-if="isEdit >= 1 && isEdit <= 2">
                <button class="button btn disabled" @click="close">{{lan['取消']}}</button>
                <button class="button btn" @click="save">{{lan['保存']}}</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { useState, changePropertyValue } from '../store';
import { useRoute, useRouter } from 'vue-router';
import SelectModule from './SelectModule.vue';
import { org, upload } from '../util/api';
import { getQueryVariable, getLocalTime, createMsg } from '../util/ADS';

export default {
    components: {
        SelectModule, 
    },
    props: {
        isEdit: Number,
        source: Object,
    },
    emits: ['close-contract', 'save-contract'],
    name: 'contractModule',
    setup(props, context) {
        const { baseURL, userRole, orgKey, lan, lanType } = toRefs(useState());
        const router = useRouter();

        const parameter = ref({'contractNo': '', 'orgKey': '', 'title': '', 'currencySign': '$', 'amount': '','signingTime': '', 'endTime': '', 'content': '', 'enclosure': []});
        const enclosure = ref([]);
        const currencySignList = ref([{'label': '$', 'value': '$'}, {'label': '￥', 'value': '￥'}]);
        const getCurrencySign = (data) => {
            parameter.value.currencySign = data.value;
        }

        const close = () => {
            context.emit('close-contract', 0);
        }

        const save = () => {
            if(!parameter.value.contractNo){
                return createMsg('合同编号必填');
            }
            if(!parameter.value.title){
                return createMsg('合同标题必填');
            }
            if(!parameter.value.amount){
                return createMsg('合同金额必填');
            }
            if(!parameter.value.orgKey){
                return createMsg('关联服务商必选');
            }
            if(!parameter.value.content){
                return createMsg('合同概要必填');
            }
            parameter.value.enclosure = enclosure.value;
            parameter.value.signingTime = parameter.value.signingTime ? new Date(parameter.value.signingTime).getTime() : '';
            parameter.value.endTime = parameter.value.endTime ? new Date(parameter.value.endTime).getTime() : '';
            console.log(parameter.value);
            context.emit('save-contract', parameter.value);
        }

        const getValue = (data) => {
            parameter.value.orgKey = data.value;
        }

        const orgList = ref([]);
        const getOrgList = async () => {
            const result = await org.getOrgList('1528234980', '');
            if(result.status == 200){
                orgList.value = result.data.map((ele) => {
                    ele.label = lanType.value == 'en' ? ele.organizationNo : ele.name;
                    ele.value = ele._key;
                    return ele;
                });
                orgList.value.unshift({'label': lan.value['全部机构'], 'value': ''});
            }
        }

        const loadFile = async (e) => {
            let fd = new FormData();
            fd.append('file', e.target.files[0]);
            const result = await upload.uploadFile(fd);
            if(result.statusCode == 200){
                enclosure.value.push({'url': baseURL.value+result.simplePath, 'originalName': result.originalName});
            }
        }

        const deleteFile = (i) => {
            enclosure.value.splice(i, 1);
        }

        const titleO = ref({'1': '新增', '2': '编辑', '3': '查看'});

        onMounted(() => {
            parameter.value = props.source;
            enclosure.value = props.source.enclosure || [];
            if(props.isEdit == 1){
                parameter.value.currencySign = '$';
                if(userRole.value >= 1 && userRole.value <= 3){

                }else{
                    parameter.value.orgKey = orgKey.value;
                }
            }
            getOrgList();
        });

        return {
            close, save, parameter, getValue, orgList, loadFile, enclosure, deleteFile, titleO, 
            currencySignList, getCurrencySign, userRole, lan, 
        }
    }
}
</script>
<style lang="scss" scoped>
.contract-module-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}
.contract-module-box{
    position: relative;
    padding: 0 50px;
    background: #fff;
    border-radius: 5px;
    min-width: 400px;
    min-height: 300px;
}
.contract-module-head{
    position: relative;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    .close{
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        cursor: pointer;
        background: #000;
    }
}
.contract-module-content{
    margin: 20px 0;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 980px;
    .form-box{
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 0 20px 0;
        .label{
            width: 100px;
        }
        .input-box{
            position: relative;
            height: 30px;
            width: 218px;
            border: 1px solid #358acd;
            background: #348acd;
            border-radius: 5px;
            overflow: hidden;
            &.red{
                border-color: #f00;
            }
            i{
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                line-height: 30px;
                text-align: center;
                cursor: pointer;
                color: #fff;
                display: block;
            }
        }
        .input{
            height: 30px;
        }
        .upload-input{
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            opacity: 0;
            z-index: 100;
            background: transparent;
            cursor: pointer;
        }
        .textarea{
            position: relative;
            width: 860px;
            height: 100px;
            border: 1px solid #ddd;
            outline: none;
            padding: 10px;
            border-radius: 5px;
            &.red{
                border-color: #f00;
            }
        }
    }
}
.contract-module-foot{
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 20px;
    .disabled{
        background: #fff;
        color: #333;
        border: 1px solid #ddd;
    }
}
.download{
    width: 300px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .file{
        display: block;
        height: 30px;
        line-height: 30px;
    }
    .delete{
        cursor: pointer;
        background: #000;
    }
}
.w80{
    width: 80px;
}
.w218{
    width: 218px !important;
}
.w138{
    width: 138px !important;
}
</style>