<template>
    <div class="module-wrap">
        <div class="module-box">
            <div class="module-head">
                <h3 class="title">{{lan['谱目明细列表']}}</h3>
                <img class="close" @click="close" src="../assets/close.svg" alt="">
            </div>
            <div class="module-source">
                <div class="source-box">
                    <label class="label" for="">{{lan['来源时间']}}:</label>
                    <span>{{timeStr}}</span>
                </div>
                <div class="source-box">
                    <label class="label" for="">{{lan['来源机构']}}:</label>
                    <span>{{orgKeyN ? orgName : lan['全部机构']}}</span>
                </div>
                <div class="source-box">
                    <label class="label" for="">{{lan['来源状态']}}:</label>
                    <span>{{condition ? condition : lan['全部状态']}}</span>
                </div>
                <div class="source-box">
                    <el-date-picker
                        class="width260"
                        v-model="time"
                        type="daterange"
                        unlink-panels
                        :start-placeholder="lan['开始时间']"
                        :end-placeholder="lan['结束时间']"
                    />
                    <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
                </div>
            </div>
            <div class="module-content style1">
                <table class="table">
                    <thead class="thead">
                        <tr>
                            <th v-for="(item, index) in theadV" :key="'thead_'+index" @click="sort(item)">{{lan[item]}} <img v-if="item == '档案时间'" :src="sortType == 'asc' ? asc : sortType == 'desc' ? desc : ''" alt=""></th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(item, index) in tbody" :key="'tbody_'+index" :class="{active: false}">
                            <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
                                <div class="action" v-if="item2 === 'action'">
                                    <button class="btn">{{lan['查看详情']}}</button>
                                </div>
                                <i v-else>{{item[item2]}}</i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <PaginationModule :defaultPage="page" :pages="pages" :total="total" v-on:change-page="changePage" />
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { useState, changePropertyValue } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { supplierMS } from '../util/api';
import { getQueryVariable, getLocalTime, createMsg } from '../util/ADS';
import PaginationModule from '../components/PaginationModule.vue';
import asc from '../assets/asc.svg';
import desc from '../assets/desc.svg';

export default {
    components: {
        PaginationModule, 
    },
    props: {
        timeStr: String,
        condition: String,
        orgKeyN: String,
        orgName: String,
    },
    emits: ['close'],
    name: 'genealogyListModule',
    setup(props, context) {
        const { baseURL, userKey, siteKey, lan } = toRefs(useState());
        const router = useRouter();

        const theadV = ref(['谱ID', '姓氏', '谱名', '出版年', '谱籍地', '堂号', '状态', '档案名称', '档案时间', '审核人', '审核时间', '上传机构', '上传时间']);
        const parameterV = ref(['_key', 'surname', 'genealogyName', 'publish', 'place', 'hall', 'condition', 'Filenames', 'FiletimesO', 'checkUserName', 'checkTimeO', 'orgName', 'createTimeO']);
        const tbody = ref([]);
        const page = ref(1);
        const pages = ref(0);
        const limit = ref(30);
        const total = ref(0);
        const sortType = ref('auto');
        const sortField = ref('');
        const time = ref('');
        const createStartTime = ref('');
        const createEndTime = ref('');

        watch(time, (nv, ov) => {
            if(nv){
                createStartTime.value = new Date(nv[0]).getTime();
                createEndTime.value = new Date(nv[1]).getTime() + 24*60*60*1000 - 1;
            }else{
                createStartTime.value = '';
                createEndTime.value = '';
            }
            
        });

        const getDataList = async () => {
			changePropertyValue('isLoading', true);
            const result = await supplierMS.monthlySummaryList(props.timeStr, createStartTime.value, createEndTime.value, props.condition, props.orgKeyN, sortField.value, sortType.value, page.value, limit.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.result.list.map((ele) => {
                    ele.checkTimeO = ele.checkTime ? getLocalTime(ele.checkTime, '-', 1) : '';
                    ele.createTimeO = ele.createTime ? getLocalTime(ele.createTime, '-', 1) : '';
                    ele.FiletimesO = ele.Filetimes ? getLocalTime(ele.Filetimes, '-', 1) : '';
                    return ele;
                });
                pages.value = result.result.pageNum;
                total.value = result.result.total;
            }
        }

        const close = (f = 0) => {
            context.emit('close', f);
        }

        const changePage = (i) => {
            page.value = i;
            getDataList();
        }

        const sort = (data) => {
            if(data == '档案时间'){
                sortField.value = 'Filetimes';
                if(sortType.value == 'auto'){
                    sortType.value = 'asc';
                }else if(sortType.value == 'asc'){
                    sortType.value = 'desc';
                }else if(sortType.value == 'desc'){
                    sortType.value = 'auto';
                    sortField.value = '';
                }
                getDataList();
            }
        }

        onMounted(() => {
            getDataList();
        });

        return {
            close, lan, theadV, parameterV, tbody, page, pages, total, changePage, sort, sortType, sortField, desc, asc,
            time, getDataList,
        }
    }
}
</script>
<style lang="scss" scoped>
.module-wrap{
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
.module-box{
    position: relative;
    width: calc(100% - 80px);
    height: calc(100% - 40px);
    background: #fff;
    border-radius: 5px;
}
.module-head{
    position: relative;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    .close{
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 20px;
        cursor: pointer;
        background: #000;
    }
}
.module-source{
    position: relative;
    width: calc(100% - 40px);
    margin: 0 auto;
    height: 40px;
    display: flex;
    align-items: center;
    .source-box{
        display: flex;
        align-items: center;
        margin-right: 40px;
        .label{
            margin-right: 10px;
        }
    }
}
.module-content{
    position: relative;
    height: calc(100% - 140px);
    width: calc(100% - 40px);
    margin: 0 auto;
    overflow-y: auto;
}
.table{
    position: relative;
    width: 100%;
    max-height: 100%;
    text-align: center;
    border: none;
    border-collapse: collapse;
    color: #000;
    border: 1px solid #ddd;
    .thead{
        position: relative;
        width: 100%;
        height: 40px;
        background: #D1D1D1;
        position: sticky;
        top: 0;
        z-index: 2;
        tr{
            th{
                padding: 5px 0;
                min-width: 80px;
                border: 1px solid #ddd;
                cursor: pointer;
            }
        }
    }
    .tbody{
        position: relative;
        width: 100%;
        height: calc(100% - 42px);
        font-size: 14px;
        tr{
            &:nth-of-type(even){
                background: #F2F2F2;
            }
            &:hover{
                background: #DBE6CC;
            }
            &.active{
                .qingtime-check-box{
                    background: #358acd;
                }
            }
            td{
                padding: 15px 0;
                min-width: 80px;
                border: 1px solid #ddd;
                .action{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
    }
    .btn{
        padding: 0 10px;
        width: auto;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        background: #358acd;
        color: #fff;
        outline: none;
        border: none;
        cursor: pointer;
        border-radius: 3px;
        &.disabled{
            background: #ddd;
            cursor: default;
        }
    }
    .marginR10{
        margin: 0 5px;
    }
}
.width260{
    width: 260px !important;
}
</style>