<template>
    <div class="contract-wrap" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="contract-head">
            <div class="head-left">
                <h3>{{lan['影像审核明细']}}</h3>
                <div class="toggle-box" @click="changeToggle">
                    <i>{{!toggle ? lan['展开'] : lan['收起']}}</i>
                </div>
            </div>
        </div>
        <div class="search-wrap">
            <div class="search-box">
                <el-input class="width150" v-model="genealogyName" :placeholder="lan['请输入谱名']"></el-input>
                <el-input class="width150" v-model="catalogKey" :placeholder="lan['请输入谱ID']"></el-input>
                <label for="">{{lan['初次上传时间']}}</label>
                <el-date-picker
                    class="width260"
                    v-model="firstSubmitTime"
                    type="daterange"
                    unlink-panels
                    :start-placeholder="lan['开始时间']"
                    :end-placeholder="lan['结束时间']"
                />
                <label for="">{{lan['审核日期']}}</label>
                <el-date-picker
                    class="width260"
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    :start-placeholder="lan['开始时间']"
                    :end-placeholder="lan['结束时间']"
                />
                <!-- <el-select v-model="condition" class="width120" multiple :placeholder="lan['谱审核状态']">
                    <el-option v-for="item in conditionList" :key="item.value" :label="lan[item.label]" :value="item.value" />
                </el-select> -->
                <el-select v-if="userRole >= 1 && userRole <= 3" v-model="orgKeyN" class="width120" :placeholder="lan['机构筛选']">
                    <el-option v-for="item in orgList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="status" class="width120 select-position" multiple :placeholder="lan['卷审核状态']">
                    <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button type="primary" @click="handleSearch">{{lan['检索']}}</el-button>
                <el-button type="primary" @click="getimageVerifyDetailDownload">{{lan['下载']}}</el-button>
            </div>
        </div>
        <div class="search-wrap" :class="{active: !toggle}">
            <div class="search-box">
                <label for="">{{lan['最新上传时间']}}</label>
                <el-date-picker
                    class="width260"
                    v-model="uploadTime"
                    type="daterange"
                    unlink-panels
                    :start-placeholder="lan['开始时间']"
                    :end-placeholder="lan['结束时间']"
                />
            </div>
        </div>
        <div class="contract-content style1" :class="{active: toggle}">
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th :class="{width120: index >= 9 && index <= 10}" v-for="(item, index) in theadV" :key="'thead_'+index">{{lan[item]}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr :class="{active: item.all}" v-for="(item, index) in tbody" :key="'tbody_'+index">
                        <td :class="{width120: index2 >= 9 && index2 <= 10}" v-for="(item2, index2) in parameterV" :key="'parameter_'+index2">
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
import { getQueryVariable, getLocalTime, downliadLink, getNowTimestamp, getLastYearTodayTimestamp, thousands } from '../util/ADS';
import { supplierMS, org } from '../util/api';
import PaginationModule from '../components/PaginationModule.vue';

export default {
    components: {
        PaginationModule,
    },
    name: 'imageStatistics',
    props: ['id'],
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(30);

        const theadV = ref(['ProjectID', '卷ID', '卷名', '谱ID', '谱名', '拍数', '类别', '所属机构', '操作员', '初次上传时间','最新上传时间', '审核日期', '审核人', '谱状态', '卷状态']);
        const parameterV = ref(['ProjectID', 'volumeKey', 'volumeNumber', 'gcKey', 'genealogyName', 'imgNumber', 'singleOrTwo', 'orgName', 'operName', 'firstSubmitTimeO','submitTimeO', 'passTimeO', 'passUserName', 'condition', 'statusO']);

        const orgList = ref([]);
        const orgKeyN = ref('');
        const startTime = ref('');
        const endTime = ref('');
        const uploadStartTime = ref('');
		const uploadEndTime = ref('');
        const time = ref('');
        const uploadTime = ref('');
        const firstSubmitTime = ref('');
        const firstSubmitStartTime = ref('');
        const firstSubmitEndTime = ref('');
        const genealogyName = ref('');
        const catalogKey = ref('');
        let returnReasonO = '', conditionO = {'d': '重复', 'r': '无效', 'm': '待议', 'nf': '谱目通过', 'f': '影像通过'};
        const getImageVerifyDetail = async (f = true) => {
			changePropertyValue('isLoading', true);
            const result = await supplierMS.getImageVerifyDetail(orgKeyN.value, siteKey.value, genealogyName.value, catalogKey.value, condition.value.join(','), startTime.value, endTime.value, uploadStartTime.value, uploadEndTime.value, firstSubmitStartTime.value, firstSubmitEndTime.value, status.value.join(','), page.value , limit.value);
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                let imageNumber = 0;
                tbody.value = result.data.list.map((ele) => {
                    if(ele.returePageArray && ele.returePageArray.length){
                        if(ele.rrType == 2){
                            ele.returePageArray.forEach(element => {
                                returnReasonO = returnReasonO + '第'+ (element.index+1) + '拍 ' + element.returnReason+',';
                            });
                        }else{
                            ele.returePageArray.forEach(element => {
                                returnReasonO = returnReasonO + element.returnReason;
                            });
                        }
                        
                        ele.returnReasonO = returnReasonO;
                        returnReasonO = '';
                    }
                    ele.condition = ele.condition;//+'|'+conditionO[ele.condition]
                    imageNumber = imageNumber + ele.imgNumber;

                    ele.orgName = lan.value[ele.orgName] + '|' + ele.organizationNo;
                    ele.firstSubmitTimeO = ele.firstSubmitTime ? getLocalTime(ele.firstSubmitTime, '-', 1) : '';
                    ele.passTimeO = ele.passTime ? getLocalTime(ele.passTime, '-', 1) : '';
                    ele.submitTimeO = ele.submitTime ? getLocalTime(ele.submitTime, '-', 1) : '';
                    ele.singleOrTwo = ele.singleOrTwo == '2' ? lan.value['双拍'] : ele.singleOrTwo == '1' ? lan.value['单拍'] : '';
                    ele.statusO = ele.takeStatus >= 7 && ele.takeStatus <= 9 ? lan.value['通过'] : ele.takeStatus == 12 ? lan.value['机构审核'] : ele.takeStatus == 5 ? lan.value['微站初审'] : ele.takeStatus == 13 ? lan.value['微站复审'] : ele.takeStatus == 14 ? lan.value['微站待议'] : ele.takeStatus == 6 ? lan.value['打回'] : ele.takeStatus == 16 ? lan.value['作废'] : '';
                    
                    ele.imgNumber = thousands(ele.imgNumber);
                    
                    return ele;
                });
                tbody.value.push({'ProjectID': lan.value['本页小计'], 'imgNumber': thousands(imageNumber)});
                pages.value = result.data.pageNum;
                total.value = thousands(result.data.total);
                f ? imageVerifyDetailTotal() : null;
            }
        }

        // 下载数据
        const getimageVerifyDetailDownload = async () => {
            changePropertyValue('isLoading', true);
            const result = await supplierMS.getimageVerifyDetailDownload({
                'orgKey': orgKeyN.value, 
                'siteKey': siteKey.value, 
                'genealogyName': genealogyName.value, 
                'catalogKey': catalogKey.value, 
                'condition': condition.value.join(','), 
                'startTime': startTime.value, 
                'endTime': endTime.value, 
                'uploadStartTime': uploadStartTime.value,
                'uploadEndTime': uploadEndTime.value,
                'firstSubmitStartTime': firstSubmitStartTime.value,
                'firstSubmitEndTime': firstSubmitEndTime.value,
                'status': status.value.join(','), 
                'lanType': lanType.value,
                'limit': 10000,
            });
            changePropertyValue('isLoading', false);
			if(result.status == 200){
                downliadLink(result.result);
            }
        }

        const imageVerifyDetailTotal = async () => {
            const result = await supplierMS.imageVerifyDetailTotal(orgKeyN.value, siteKey.value, genealogyName.value, catalogKey.value, condition.value.join(','), startTime.value, endTime.value, uploadStartTime.value, uploadEndTime.value, firstSubmitStartTime.value, firstSubmitEndTime.value, status.value.join(','), page.value , limit.value);
            if(result.status == 200){
                let data = result.data;
                tbody.value.push({'ProjectID': lan.value['汇总统计'], 'all': true, 'imgNumber': thousands(data.imageNumber)});
            }
        }

        const handleSearch = () => {
            page.value = 1;
            getImageVerifyDetail();
        }

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

        const status = ref(['7']);
        const statusList = ref([
            // {'label': '卷审核状态', 'value': ''}, 
            {'label': lan.value['机构审核'], 'value': '12'}, 
            {'label': lan.value['微站初审'], 'value': '5'},
            {'label': lan.value['微站复审'], 'value': '13'}, 
            {'label': lan.value['微站待议'], 'value': '14'},
            {'label': lan.value['已打回'], 'value': '6'}, 
            {'label': lan.value['已通过'], 'value': '7'},
            {'label': lan.value['已作废'], 'value': '16'},
        ]);

        const condition = ref(['nf', 'f']);
        const conditionList = ref([
            {label: '谱状态', value: ''}, 
            {label: 'd|重复', value: 'd'},
            {label: 'r|无效', value: 'r'},
            {label: 'm|待议', value: 'm'},
            {label: 'nf|谱目通过', value: 'nf'},
            {label: 'f|影像通过', value: 'f'},
        ]);

        watch(time, (nv, ov) => {
            if(nv){
                startTime.value = new Date(nv[0]).getTime();
                endTime.value = new Date(nv[1]).getTime() + 24*60*60*1000 - 1;
            }else{
                startTime.value = getLastYearTodayTimestamp();
                endTime.value = getNowTimestamp(1) - 1;
            }
            
        });

        watch(uploadTime, (nv, ov) => {
            if(nv){
                uploadStartTime.value = new Date(nv[0]).getTime();
                uploadEndTime.value = new Date(nv[1]).getTime() + 24*60*60*1000 - 1;
            }else{
                uploadStartTime.value = getLastYearTodayTimestamp();
                uploadEndTime.value = getNowTimestamp(1) - 1;
            }
            
        });

        watch(firstSubmitTime, (nv, ov) => {
            if(nv){
                firstSubmitStartTime.value = new Date(nv[0]).getTime();
                firstSubmitEndTime.value = new Date(nv[1]).getTime() + 24*60*60*1000 - 1;
            }else{
                firstSubmitStartTime.value = getLastYearTodayTimestamp();
                firstSubmitEndTime.value = getNowTimestamp(1) - 1;
            }
            
        });

        const changePage = (i) => {
            page.value = i;
            getImageVerifyDetail();
        }

        const tbody = ref([]);

        onMounted(() => {
            if(userRole.value >= 1 && userRole.value <= 3){
                orgKeyN.value = getQueryVariable('orgKey');
            }else{
                orgKeyN.value = orgKey.value;
            }
            
            if(getQueryVariable('isAll')){
                firstSubmitTime.value = getQueryVariable('firstSubmitStartTime') ? [Number(getQueryVariable('firstSubmitStartTime')), Number(getQueryVariable('firstSubmitEndTime')) - 24*60*60*1000 + 1] : '';
                firstSubmitStartTime.value = getQueryVariable('firstSubmitStartTime');
                firstSubmitEndTime.value = getQueryVariable('firstSubmitEndTime');

                uploadTime.value = getQueryVariable('uploadStartTime') ? [Number(getQueryVariable('uploadStartTime')), Number(getQueryVariable('uploadEndTime')) - 24*60*60*1000 + 1] : '';
                uploadStartTime.value = getQueryVariable('uploadStartTime');
                uploadEndTime.value = getQueryVariable('uploadEndTime');

                time.value = getQueryVariable('startTime') ? [Number(getQueryVariable('startTime')), Number(getQueryVariable('endTime')) - 24*60*60*1000 + 1] : '';
                startTime.value = getQueryVariable('startTime');
                endTime.value = getQueryVariable('endTime');

                if(!startTime.value){
                    status.value = [];
                }
            }else{
                // uploadTime.value = [getLastYearTodayTimestamp(), getNowTimestamp()];
                // uploadStartTime.value = getLastYearTodayTimestamp();
                // uploadEndTime.value = getNowTimestamp(1) - 1;

                time.value = [getLastYearTodayTimestamp(), getNowTimestamp()];
                startTime.value = getLastYearTodayTimestamp();
                endTime.value = getNowTimestamp(1) - 1;
            }
            
            getOrgList();
            handleSearch();
        });

        const toggle = ref(false);
        const changeToggle = () => {
            toggle.value = !toggle.value;
        }

        return {
            page, pages, total, theadV, parameterV, tbody, getImageVerifyDetail, sidebarW, toggle, changeToggle,
            changePage, time, uploadTime, orgList, orgKeyN, statusList, status, userRole, lan, handleSearch,
            genealogyName, catalogKey, condition, conditionList, getimageVerifyDetailDownload, firstSubmitTime, firstSubmitStartTime, firstSubmitEndTime,
        }
    }
}
</script>

<style lang="scss" scoped>
.contract-wrap{
    position: relative;
    width: calc(100% - 250px);
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
    .head-left{
        display: flex;
        align-items: flex-end;
        .toggle-box{
            display: flex;
            align-items: flex-end;
            font-size: 10px;
            margin-left: 10px;
            cursor: pointer;
        }
    }
    .head-right{
        display: flex;
        align-items: center;
    }
}
.contract-content{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: calc(100% - 140px);
    overflow-y: auto;
    &.active{
        height: calc(100% - 180px);
    }
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
                padding: 5px 10px;
                min-width: 80px;
                // max-width: 200px;
                border: 1px solid #ddd;
                font-size: 14px;
                &.width120{
                    width: 120px;
                }
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
                position: sticky;
                bottom: 0;
                background: #DBE6CC;
                font-weight: bold;
            }
            td{
                padding: 15px 10px;
                min-width: 80px;
                // max-width: 200px;
                border: 1px solid #ddd;
                &.width120{
                    width: 120px;
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
.width150{
    width: 150px;
}
.width120{
    width: 120px;
}
.search-wrap{
    width: calc(100% - 40px);
    padding: 0 20px;
    height: 40px;
    &.active{
        display: none;
    }
    .search-box{
        display: inline-flex;
        justify-content: flex-start;
        align-items: center;
    }
}
.select-position{
    height: 32px;
}
</style>