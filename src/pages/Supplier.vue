<template>
    <div class="supplier-wrap style1" :style="{width: 'calc(100% - '+sidebarW+'px)'}">
        <div class="supplier-head">
            <h3>{{lan['首页1']}}</h3>
            <el-select class="width120" v-model="language">
                <el-option v-for="item in [{'label': '中文', 'value': 'zh'}, {'label': 'English', 'value': 'en'}]" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
        </div>
        <div class="supplier-content">
            <h3 class="title">{{lan['待做事项']}}</h3>
            <ul class="todo-ul">
                <li v-for="(item, index) in todo" :key="index" v-show="!(userRole >= 4 && index == 2)">
                    <p>{{lan[item.name]}}:</p>
                    <span>{{item.count}}</span>
                </li>
            </ul>
        </div>
        <div class="supplier-foot">
            <h3 class="title">{{lan['数据汇总(2022.9-至今)']}}</h3>
            <ul class="data-count">
                <li v-for="(item, index) in dataCount" :key="index" @click="goRouter(index)" v-show="!(userRole >= 4 && index == 3)">
                    <img class="chart" :src="item.img" alt="">
                    <div class="data-box">
                        <p>{{lan[item.name]}}</p>
                        <span>{{item.count}}</span>
                    </div>
                </li>
            </ul>
        </div>
        <div class="supplier-foot">
            <div class="head">
                <h3>{{lan['年度一栏表']}}</h3>
                <el-date-picker
                    class="w130"
                    v-model="year"
                    :clearable="false"
                    type="year">
                </el-date-picker>
            </div>
            <div class="supplier-foot">
                <h3 class="title fontSize16">{{lan['年度发票情况']}}</h3>
                <ul class="todo-ul">
                    <li class="w33" v-for="(item, index) in BillCount" :key="index">
                        <p>{{lan[item.name]}}:</p>
                        <span>{{item.count}}</span>
                    </li>
                </ul>
                <ul class="todo-ul">
                    <li class="w33" v-for="(item, index) in PayCount" :key="index">
                        <p>{{lan[item.name]}}:</p>
                        <span>{{item.count}}</span>
                    </li>
                </ul>
            </div>
            <div class="supplier-foot" v-if="userRole >= 1 && userRole <= 3">
                <h3 class="title fontSize16">{{lan['年度收购情况']}}</h3>
                <el-table 
                    class="el-table-box marginT20"
                    border
                    :data="tableData">
                    <el-table-column prop="type" :label="yearO+lan['年度']" :align="'center'" />
                    <el-table-column prop="allCount" :label="lan['数据汇总']" :align="'center'" />
                    <el-table-column prop="寻源堂" :label="lan['寻源堂']" :align="'center'" />
                    <el-table-column prop="成蹊" :label="lan['成蹊']" :align="'center'" />
                    <el-table-column prop="馨里有谱" :label="lan['馨里有谱']" :align="'center'" />
                    <el-table-column prop="仰沁" :label="lan['仰沁']" :align="'center'" />
                    <el-table-column prop="良友科苑" :label="lan['良友科苑']" :align="'center'" />
                    <el-table-column prop="时光科技" :label="lan['时光科技']" :align="'center'" />
                    <el-table-column prop="古中山" :label="lan['古中山']" :align="'center'" />
                </el-table>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, setValue, getValue, createMsg, thousands } from '../util/ADS';
import { supplierMS } from '../util/api';
import { CN } from '../language/CN.js';
import { EN } from '../language/EN.js';
import total from '../assets/home/total.svg';
import images from '../assets/home/images.svg';
import amount from '../assets/home/amount.svg';
import org from '../assets/home/org.svg';

export default {
    components: {
        
    },
    name: 'supplier',
    props: ['id'],
    setup(props, context) {
        const { token, userKey, siteKey, userRole, lan, sidebarW, lanType } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const todo = ref([
            {'name': '新谱查重(条)', 'count': 0},
            {'name': '查重待议(条)', 'count': 0},
            {'name': '编目待议(条)', 'count': 0},
            {'name': '影像审核(册)', 'count': 0},
        ]);

        const dataCount = ref([
            {'name': '谱目总数', 'count': 0, 'img': total},
            {'name': '总影像页数', 'count': 0, 'img': images},
            {'name': '影像总支出', 'count': 0, 'img': amount},
            {'name': '影像机构', 'count': 0, 'img': org},
        ]);

        const BillCount = ref([
            {'name': '申请发票数', 'count': 0,},
            {'name': '已确认发票数', 'count': 0,},
            {'name': '已付款发票数', 'count': 0,},
        ]);

        const PayCount = ref([
            {'name': '申请金额(应付)', 'count': 0,},
            {'name': '已确认金额(实付)', 'count': 0,},
            {'name': '已付款金额(实付)', 'count': 0,},
        ]);

        const year = ref(new Date().getFullYear()+'');
        const yearO = ref(new Date().getFullYear());

        const tableData = ref([]);

        watch(year, (nv, ov) => {
            console.log(new Date(nv).getFullYear());
            yearO.value  = new Date(nv).getFullYear();
            getHomePageYear(new Date(nv).getFullYear());
        });

        const getHomePage = async () => {
            const result = await supplierMS.getHomePage(userKey.value, siteKey.value);
            if(result.status == 200){
                todo.value.forEach((ele, i) => {
                    if(i === 0){
                        ele.count = thousands(result.data.sumbmitNum);
                    }
                    if(i === 1){
                        ele.count = thousands(result.data.toBeDiscussedGCNumber);
                    }
                    if(i === 2){
                        ele.count = thousands(result.data.checkTaskNumber);
                    }
                    if(i === 3){
                        ele.count = thousands(result.data.waitReviewCount);
                    }
                });
                dataCount.value.forEach((ele, i) => {
                    if(i === 0){
                        ele.count = thousands(result.data.allGCCount);
                    }
                    if(i === 1){
                        ele.count = thousands(result.data.allImageCount);
                    }
                    if(i === 2){
                        ele.count = '$'+thousands(result.data.totalAmount || "0.00");
                    }
                    if(i === 3){
                        ele.count = thousands(result.data.allImageOrgCount - 1);
                    }
                });
                getHomePageYear(year.value);
            }else{

            }
        }

        const getHomePageYear = async (year) => {
            const result = await supplierMS.getHomePageYear({
                'userKey': userKey.value,
                'year': year
            });
            if(result.status == 200){
                BillCount.value.forEach((ele, i) => {
                    if(i === 0){
                        ele.count = thousands(result.data.waitSettlementCount);
                    }
                    if(i === 1){
                        ele.count = thousands(result.data.settlementCount);
                    }
                    if(i === 2){
                        ele.count = thousands(result.data.paidCount);
                    }
                });
                PayCount.value.forEach((ele, i) => {
                    if(i === 0){
                        ele.count = '$'+thousands((result.data.waitSettlementAmount).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') || '0.00');
                    }
                    if(i === 1){
                        ele.count = '$'+thousands((result.data.settlementAmount).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') || '0.00');
                    }
                    if(i === 2){
                        ele.count = '$'+thousands((result.data.paidAmount).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') || '0.00');
                    }
                });
                tableData.value = result.data.resultArray.map((ele, i) => {
                    ele.type = lan.value[ele.type];
                    if(i >= 2){
                        ele.allCount = (ele.allCount || '0.00')+'%';
                        ele['仰沁'] = (ele['仰沁'] || '0.00')+'%';
                        ele['古中山'] = (ele['古中山'] || '0.00')+'%';
                        ele['寻源堂'] = (ele['寻源堂'] || '0.00')+'%';
                        ele['成蹊'] = (ele['成蹊'] || '0.00')+'%';
                        ele['时光科技'] = (ele['时光科技'] || '0.00')+'%';
                        ele['良友科苑'] = (ele['良友科苑'] || '0.00')+'%';
                        ele['馨里有谱'] = (ele['馨里有谱'] || '0.00')+'%';
                    }else{
                        ele.allCount = thousands(ele.allCount);
                        ele['仰沁'] = thousands(ele['仰沁']);
                        ele['古中山'] = thousands(ele['古中山']);
                        ele['寻源堂'] = thousands(ele['寻源堂']);
                        ele['成蹊'] = thousands(ele['成蹊']);
                        ele['时光科技'] = thousands(ele['时光科技']);
                        ele['良友科苑'] = thousands(ele['良友科苑']);
                        ele['馨里有谱'] = thousands(ele['馨里有谱']);
                    }
                    return ele;
                });
            }else{

            }
        }

        const language = ref('zh');
        watch(language, () => {
            changePropertyValue('lan', language.value == 'zh' ? CN : EN);
            changePropertyValue('lanType', language.value);
            setValue('lanType', language.value);
        });

        onMounted(() => {
            language.value = lanType.value;
            getHomePage();
        });

        const goRouter = (i) => {
            if(i == 3){
                router.push('/orgList');
            }
        }

        return {
            todo, dataCount, language, lan, sidebarW, goRouter, BillCount, PayCount, tableData, yearO, year, userRole,
        }
    }
}
</script>

<style lang="scss" scoped>
.supplier-wrap{
    position: relative;
    width: calc(100% - 290px);
    height: 100%;
    color: #333;
    overflow-y: auto;
}
.supplier-head{
    position: relative;
    width: calc(100% - 40px);
    padding: 0 20px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.supplier-content{
    position: relative;
    width: calc(100% - 82px);
    border: 1px solid #ddd;
    border-radius: 10px;
    margin: 0 20px;
    padding: 0 20px;
}
.title{
    height: 60px;
    line-height: 60px;
    color: #358acd;
    border-bottom: 1px solid #ddd;
}
.todo-ul{
    position: relative;
    display: flex;
    // justify-content: space-around;
    align-items: center;
    margin: 20px 0;
    text-align: center;
    li{
        cursor: pointer;
        display: flex;
        align-items: center;
        width: 25%;
        span{
            font-size: 20px;
            color: #358acd;
            margin-left: 10px;
        }
        &.w33{
            width: 33%;
        }
    }
}
.supplier-foot{
    position: relative;
    border: 1px solid #ddd;
    border-radius: 10px;
    width: calc(100% - 82px);
    padding: 0 20px 20px 20px;
    margin: 20px 20px 0 20px;
}
.data-count{
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    text-align: center;
    li{
        width: calc(25% - 10px);
        height: 100px;
        border: 1px solid #ddd;
        border-radius: 10px;
        margin-top: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        .chart{
            height: 40px;
        }
        .data-box{
            margin-left: 20px;
            span{
                font-size: 20px;
                color: #358acd;
            }
        }
    }
}
@media screen  and (max-width: 799px){
    .supplier-wrap{
        position: relative;
        width: 100% !important;
    }
    .todo-ul{
        li{
            margin-right: 20px;
        }
    }
    .data-count{
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        text-align: center;
        li{
            width: 100%;
            height: 100px;
            border: 1px solid #ddd;
            border-radius: 10px;
            margin-top: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            .chart{
                height: 40px;
            }
            .data-box{
                margin-left: 20px;
                span{
                    font-size: 20px;
                    color: #358acd;
                }
            }
        }
    }
    .width120{
        width: 120px;
    }
}
.fontSize16{
    font-size: 16px;
}
.marginT20{
    margin-top: 20px;
}
.head{
    display: flex;
    // justify-content: space-between;
    align-items: center;
    height: 60px;
    line-height: 60px;
    color: #358acd;
    border-bottom: 1px solid #ddd;
    h3{
        margin-right: 20px;
    }
}
</style>