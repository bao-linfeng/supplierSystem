<template>
    <div class="chart-wrap">
        <div class="chart-box">
            <div class="head-box">
                <!-- <h3 class="title">{{orgName ? orgName+'  ' : ''}}{{new Date(year).getFullYear()}} {{lan['年度汇总数据']}}</h3> -->
                <div class="head-right">
                    <el-select v-model="chartType" class="chartType" :placeholder="lan['图表类型']">
                        <el-option v-for="item in chartTypeList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                    <img class="close" @click="close" src="../assets/close.svg" alt="">
                </div>
            </div>
            <div id="adai-chart"></div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted,  onUnmounted} from 'vue';
import { useState, changePropertyValue } from '../store';

export default {
    props:{
        chartData: Object,
        subtitle: String, 
        title: String,
        stackArea: {
            type: Boolean,
            default: false,
        }
    },
    emits: ['close'],
    name: 'echartsModule',
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan } = toRefs(useState());
        const close = () => {
            context.emit('close', false);
        }

        const chartType = ref('bar');
        const chartTypeList = ref([
            {'label': lan.value['柱状图'], 'value': 'bar'}, 
            {'label': lan.value['折线图'], 'value': 'line'},
        ]);
        let adaiChart, dom, option, datasets = [], O = {};

        watch(chartType, (nv, ov) => {
            if(props.stackArea){
                if(nv == 'line-area'){
                    props.chartData.label[0] = lan.value['目标数量'];
                }else{
                    props.chartData.label[0] = lan.value['总册数'];
                }
            }
            
            initChart();
        });

        const initChart = () => {
            adaiChart ? adaiChart.dispose() : null;
            adaiChart = null;

            datasets = [];
            props.chartData.label.forEach((ele, i) => {
                if(chartType.value == 'line-area'){
                    O = {
                        name: ele,
                        type: chartType.value == 'bar' ? 'bar' : 'line',
                        label: {
                            show: true,
                            position: 'top',
                            fontSize: 9,
                        },
                        data: props.chartData.dataCount[i]
                    }
                    if(i){
                        O.areaStyle = {};
                    }
                    datasets.push(O);
                }else{
                    datasets.push({
                        name: ele,
                        type: chartType.value == 'bar' ? 'bar' : 'line',
                        label: {
                            show: true,
                            position: 'top',
                            fontSize: 9,
                        },
                        data: props.chartData.data[i]
                    });
                }
            });

            adaiChart = echarts.init(dom, null, {
                renderer: 'canvas',
                useDirtyRect: false
            });

            option = {
                title: {
                    text: props.subtitle + ' ' + props.title,
                    x: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: props.chartData.label,
                    y: 30
                },
                grid: {
                    left: '0%',
                    right: '0%',
                    bottom: '0%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    data: props.chartData.labels
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: true,
                        lineStyle: {
                            // color: ''
                        }
                    },
                },
                series: datasets
            };

            if (option && typeof option === 'object') {
                adaiChart.setOption(option);
            }

            window.addEventListener('resize', adaiChart.resize);
        }

        onMounted(() => {
            dom = document.getElementById('adai-chart');
            console.table(props.chartData);
            console.table(props.chartData.dataCount);
            console.log(props.stackArea);
            if(props.stackArea){
                chartTypeList.value.push({'label': lan.value['折线堆叠图'], 'value': 'line-area'});
            }

            initChart();
        });

        onUnmounted(() => {
            adaiChart ? adaiChart.dispose() : null;
        });

        return {
            close, chartType, lan, chartTypeList,
        }
    }
}
</script>
<style lang="scss" scoped>
.chart-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    background: rgba(0,0,0,0.8);;
    .chart-box{
        position: relative;
        padding: 10px;
        background: #fff;
        border-radius: 5px;
        width: calc(100% - 200px);
        height: calc(100% - 200px);
        .head-box{
            position: relative;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            .head-right{
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 0;
                display: flex;
                align-items: center;
                margin-left: auto;
                .chartType{
                    width: 120px;
                }
                .close{
                    margin-left: 10px;
                    background: #000;
                    cursor: pointer;
                }
            }
        }
        #adai-chart{
            position: relative;
            width: 100%;
            height: calc(100% - 40px);
        }
    }
}
</style>