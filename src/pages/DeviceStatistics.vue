<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <h3>{{lan['拍机拍摄数量汇总']}}</h3>
            <div class="head-right">
                <el-date-picker
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    :start-placeholder="lan['开始时间']"
                    :end-placeholder="lan['结束时间']"
                />
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="org-select" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="type" class="org-select" :placeholder="lan['筛选方式']">
                    <el-option v-for="item in [{'label': lan['按拍机筛选'], 'value': 1}, {'label': lan['按人员筛选'], 'value': 2}]" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDevicePageStatistics">{{lan['检索']}}</el-button>
            </div>
        </div>
        <div class="contract-content style1">
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV" :key="'thead_'+index">{{lan[item]}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index">
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
                            <div v-if="item2 === 'action'">
                                <button class="button btn">下载</button>
                            </div>
                            <i v-else>{{item[item2]}}</i>
                        </td>
                    </tr>
                    <tr v-if="!tbody.length">
                        <td :colspan="parameterV.length">{{lan['暂无数据']}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <PaginationModule :defaultPage="page" :pages="pages" :total="total" v-on:change-page="changePage" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';

export default {
    components: {
        PaginationModule,
    },
    name: 'deviceStatistics',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(30);

        const theadV = ref(['拍机编号', '所属机构', '影像页数']);
        const parameterV = ref(['device', 'organizationNo', 'imageNumber']);

        const orgList = ref([]);
        const orgKeyN = ref('');
        const startTime = ref(Date.now() - 1000*60*60*24*30*6);
        const endTime = ref(Date.now());
        const time = ref('');
        const type = ref(1);
        const getDevicePageStatistics = async () => {
            tbody.value = [];
            if(type.value == 1){
                theadV.value = ['拍机编号', '所属机构', '谱书数量', '总拍数'];
                parameterV.value = ['device', 'organizationNo', 'gcNumber', 'imageNumber'];
            }else{
                theadV.value = ['用户名', '所属机构', '谱书数量', '总拍数'];
                parameterV.value = ['userName', 'organizationNo', 'gcNumber', 'imageNumber'];
            }
			changePropertyValue('isLoading', true);
            const result = await supplierMS.getDevicePageStatistics(orgKeyN.value, siteKey.value, startTime.value, endTime.value, type.value, page.value , limit.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.data.list.map((ele) => {
                    ele.organizationNo = ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '';
                    ele.passTime = ele.passTime ? getLocalTime(ele.passTime) : '';
                    
                    return ele;
                });
                pages.value = result.data.pageNum;
                total.value = result.data.list.length;
            }
        }

        const getOrgList = async () => {
            const result = await org.getOrgList(siteKey.value, '');
            if(result.status == 200){
                orgList.value = result.data.map((ele) => {
                    ele.label = ele.organizationNo+'('+ele.name+')';
                    ele.value = ele._key;
                    return ele;
                });
                orgList.value.unshift({'label': lan.value['全部机构'], 'value': ''});
            }
        }

        watch(time, (nv, ov) => {
            if(nv){
                startTime.value = new Date(nv[0]).getTime();
                endTime.value = new Date(nv[1]).getTime();
            }else{
                startTime.value = Date.now() - 1000*60*60*24*30*6;
                endTime.value = Date.now();
            }
        });

        const changePage = (i) => {
            page.value = i;
            getDevicePageStatistics();
        }

        const tbody = ref([]);

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){

            }else{
                orgKeyN.value = orgKey.value;
            }
            getOrgList();
            getDevicePageStatistics();
        });

        return {
            page, pages, total, theadV, parameterV, tbody, getDevicePageStatistics, 
            changePage, time, orgList, orgKeyN, type, userRole, lan, sidebarW, 
        }
    }
}
</script>

<style lang="scss" scoped>
.contract-wrap{
    position: relative;
    width: calc(100% - 200px);
    height: 100%;
    color: #333;
}
.contract-head{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .head-right{
        display: flex;
        align-items: center;
    }
}
.contract-content{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: calc(100% - 100px);
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
            td{
                padding: 15px 0;
                min-width: 80px;
                border: 1px solid #ddd;
            }
        }
    }
    .btn{
        padding: 0 10px;
        width: auto;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        &.disabled{
            background: #ddd;
            cursor: default;
        }
    }
    .marginR10{
        margin: 0 5px;
    }
}
.marginR10{
    margin-right: 10px;
}
.org-select{
    width: 150px;
}
</style>