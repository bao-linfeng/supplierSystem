<template>
    <div class="module-wrap">
        <div class="module-box">
            <div class="module-head">
                <h3 class="title">{{lan['影像明细列表']}}</h3>
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
            </div>
            <div class="module-content style1">
                <table class="table">
                    <thead class="thead">
                        <tr>
                            <th v-for="(item, index) in theadV" :key="'thead_'+index">{{lan[item]}}</th>
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

export default {
    components: {
        PaginationModule, 
    },
    props: {
        timeStr: String,
        orgKeyN: String,
        orgName: String,
    },
    emits: ['close'],
    name: 'imageListModule',
    setup(props, context) {
        const { baseURL, userKey, siteKey, lan } = toRefs(useState());
        const router = useRouter();

        const theadV = ref(['谱ID', '谱名', '卷ID', '卷名', '结算拍数', '单双拍', '电子谱', '审核人', '审核时间', '创建人', '创建时间']);
        const parameterV = ref(['gcKey', 'genealogyName', 'volumeKey', 'volumeNumber', 'imageNumber', 'singleOrTwoO', 'isLeadImagesO', 'passUserName', 'passTimeO', 'creatorName', 'volumeCreateTimeO']);
        const tbody = ref([]);
        const page = ref(1);
        const pages = ref(0);
        const limit = ref(30);
        const total = ref(0);

        const getDataList = async () => {
			changePropertyValue('isLoading', true);
            const result = await supplierMS.shootingCompletionList(props.timeStr, props.orgKeyN, page.value, limit.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.result.list.map((ele) => {
                    ele.passTimeO = ele.passTime ? getLocalTime(ele.passTime) : '';
                    ele.volumeCreateTimeO = ele.volumeCreateTime ? getLocalTime(ele.volumeCreateTime) : '';
                    ele.singleOrTwoO = ele.singleOrTwo == 1 ? '单拍' : ele.singleOrTwo == 2 ? '双拍' : '';
                    ele.isLeadImagesO = ele.isLeadImages ? '是' : '否';
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

        onMounted(() => {
            getDataList();
        });

        return {
            close, lan, theadV, parameterV, tbody, page, pages, total, changePage, 
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
    height: 40px;
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
        margin-right: 100px;
        .label{
            margin-right: 10px;
        }
    }
}
.module-content{
    position: relative;
    height: calc(100% - 120px);
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
</style>