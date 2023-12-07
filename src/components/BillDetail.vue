<template>
    <div class="module-wrap">
        <div class="module-box">
            <div class="module-head">
                <h3 class="title">{{lan['发票周详情']}}</h3>
                <img class="close" @click="close" src="../assets/close.svg" alt="">
            </div>
            <div class="module-content style1">
                <table class="table">
                    <thead class="thead">
                        <tr>
                            <th v-for="(item, index) in theadV" :key="'thead_'+index">{{lan[item]}}</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(item, index) in dataDetail" :key="'tbody_'+index" :class="{active: false}">
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
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { useState, changePropertyValue } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { supplierMS } from '../util/api';
import { getQueryVariable, getLocalTime, createMsg, thousands } from '../util/ADS';

export default {
    components: {
        
    },
    props: {
        dataDetail: Array,
    },
    emits: ['close'],
    name: 'billDetail',
    setup(props, context) {
        const { baseURL, userKey, siteKey, lan } = toRefs(useState());
        const router = useRouter();

        const theadV = ref(['ProjectID', '拍机人', '谱ID', '谱名', '卷名', '提交日期', '影像数', '电子谱', '单双拍', '单价', '金额小计']);
        const parameterV = ref(['ProjectID', 'userName', 'gcKey', 'genealogyName', 'volumeNumber', 'submitTimeO', 'imgNumber', 'isLeadImagesO', 'singleOrTwoO', 'priceO', 'amountO']);
        const isShow = ref(true);

        const close = (f = 0) => {
            context.emit('close', f);
        }

        onMounted(() => {
            
        });

        return {
            close, isShow, lan, theadV, parameterV, 
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
.module-content{
    position: relative;
    height: calc(100% - 80px);
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
        background: #f5f7fa;
        color: #909399;
        position: sticky;
        top: 0;
        z-index: 2;
        tr{
            th{
                padding: 5px 0;
                min-width: 80px;
                border: 1px solid #ddd;
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
@media screen  and (max-width: 799px){
    .module-head{
        .close{
            right: 10px;
        }
    }
    .module-content{
        width: calc(100% - 20px);
    }
    .module-box{
        width: 100%;
        height: 100%;
    }
}
</style>