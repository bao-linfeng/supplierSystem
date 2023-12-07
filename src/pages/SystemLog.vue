<template>
    <div class="pages-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="pages-head">
            <h3>{{lan['系统日志']}}</h3>
            <div class="head-right">
                <el-date-picker
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    :start-placeholder="lan['开始时间']"
                    :end-placeholder="lan['结束时间']"
                />
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="qingtime-select" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="logType">
                    <el-option v-for="item in logTypeList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="getDataList">{{lan['检索']}}</el-button>
            </div>
        </div>
        <div class="pages-content style1">
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
                                
                            </div>
                            <i v-else>{{item2 == 'orgName' ? lan[item[item2]] : item[item2]}}</i>
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
        PaginationModule
    },
    name: 'systemLog',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, orgKey, userRole, lan, admin, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const theadV = ref(['机构名称', '操作账号', '操作日期', '日志', '日志类型']);
        const parameterV = ref(['orgName', 'userName', 'createTimeO', 'log', 'type']);

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(30);

        const time = ref('');
		const startTime = ref(Date.now() - 1000*60*60*24*30*11);
		const endTime = ref(Date.now());
        const tbody = ref([]);
        const getDataList = async () => {
			changePropertyValue('isLoading', true);
            const result = await supplierMS.logList(startTime.value, endTime.value, logType.value, userKeyN.value, orgKeyN.value, page.value, limit.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                tbody.value = result.result.list.map((ele) => {
                    ele.organizationNo = ele.organizationNo ? ele.organizationNo +'('+ele.orgName+')' : '';
                    ele.createTimeO = ele.createTime ? getLocalTime(ele.createTime) : '';
                    ele.type = lanType.value == 'en' ? ele.logTypeEnglish : ele.logType;
                    return ele;
                });
                pages.value = result.result.pageNum;
                total.value = result.result.total;
            }
        }

        const getLogType = async () => {
            const result = await supplierMS.getLogType({});
			if(result.status == 200){
                logTypeList.value = result.data.map((ele) => {
                    ele.label = lanType.value == 'en' ? ele.en : ele.zh;
                    ele.value = ele.zh;
                    return ele;
                });
                logTypeList.value.unshift({'label': lan.value['全部类型'], 'value': ''});
            }
        }

        const userKeyN = ref('');

        const logType = ref('');
        const logTypeList = ref([]);

        const orgList = ref([]);
        const orgKeyN = ref('');
        const orgName = ref('');

        const getOrgList = async () => {
            const result = await org.getOrgList(siteKey.value, '');
            if(result.status == 200){
                orgList.value = result.data.map((ele) => {
                    ele.label = lanType.value == 'en' ? ele.organizationNo : ele.name;
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

        watch(orgKeyN, (nv, ov) => {
            orgList.value.forEach((ele) => {
                if(ele.value == nv){
                    orgName.value = nv ? ele.label : '';
                }
            });
        });
        
        const changePage = (i) => {
            page.value = i;
            getDataList();
        }

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){

            }else{
                orgKeyN.value = orgKey.value;
                if(admin.value != 'admin'){
                    userKeyN.value = userKey.value;
                }
            }
            getLogType();
            getOrgList();
            getDataList();
        });

        return {
            theadV, parameterV, tbody, getDataList, time, orgList, orgKeyN, orgName, 
            changePage, page, pages, total, userRole, lan, logTypeList, logType, sidebarW, 
        }
    }
}
</script>

<style lang="scss" scoped>
.pages-wrap{
    position: relative;
    width: calc(100% - 200px);
    height: 100%;
    color: #333;
}
.pages-head{
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
.pages-content{
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
.marginR10{
    margin-right: 10px;
}
.qingtime-check-box{
    position: relative;
    width: 18px;
    height: 18px;
    border: 1px solid #358acd;
    border-radius: 3px;
    display: block;
    cursor: pointer;
    &.active{
        background: #358acd;
    }
}
</style>