<template>
    <div class="chart-wrap">
        <div class="chart-box">
            <div class="head-box">
                <h3 class="title">{{orgName ? orgName+'  ' : ''}}{{new Date(year).getFullYear()}} {{lan['年度汇总数据']}}</h3>
                <div class="head-right">
                    <el-select v-model="chartType" class="chartType" :placeholder="lan['图表类型']">
                        <el-option v-for="item in [{'label': lan['折线图'], 'value': 'line'}, {'label': lan['柱状图'], 'value': 'bar'}]" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                    <img class="close" @click="close" src="../assets/close.svg" alt="">
                </div>
            </div>
            <div class="content-box">
                <div class="label-wrap">
                    <div class="label-box" v-for="(item, index) in chartData.label" :key="index" @click="handleCheck(item)">
                        <i class="check-box" :class="{active: checkList.indexOf(item) > -1}"></i>
                        <i class="color" :style="{background: borderColor[index]}"></i>
                        <span class="label">{{item}}</span>
                    </div>
                </div>
                <canvas id="adai-chart" :width="w" :height="h"></canvas>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { useState, changePropertyValue } from '../store';

export default {
    props:{
        chartData: Object,
        year: Number, 
        orgName: String
    },
    emits: ['close'],
    name: 'chartModule',
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan } = toRefs(useState());
        const close = () => {
            context.emit('close', false);
        }

        const chartType = ref('bar');
        let adaiChart = '';
        let ctx = '';
        const chartData = ref({});

        watch(chartType, (nv, ov) => {
            initChart(true);
        });

        const borderColor = ref([
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(155, 159, 64, 1)'
            ]);
        const backgroundColor = ref([
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(155, 159, 64, 0.2)'
            ]);

        const initChart = (f = false) => {
            if(f){
                adaiChart.destroy();
                adaiChart = '';
            }
            let datasets = [];
            props.chartData.label.forEach((ele, i) => {
                if(checkList.value.indexOf(ele) > -1){
                    datasets.push({
                        label: ele,
                        data: props.chartData.data[i],
                        backgroundColor: backgroundColor.value[i],
                        borderColor: borderColor.value[i],
                        borderWidth: 1,
                    });
                }
            });
            if(adaiChart){
                adaiChart.data.datasets = datasets;
                adaiChart.update();
            }else{
                adaiChart = new Chart(ctx, {
                    type: chartType.value,
                    data: {
                        labels: props.chartData.labels,
                        datasets: datasets
                    },
                    options: {
                        // hover: {
                        //     animationDuration: 0  // 防止鼠标移上去，数字闪烁
                        // },
                        // animation: {           // 这部分是数值显示的功能实现
                        //     onComplete: function () {
                        //         var chartInstance = this.chart,
            
                        //         ctx = chartInstance.ctx;
                        //         // 以下属于canvas的属性（font、fillStyle、textAlign...）
                        //         // ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                        //         ctx.fillStyle = "black";
                        //         ctx.textAlign = 'center';
                        //         ctx.textBaseline = 'bottom';
            
                        //         datasets.forEach(function (dataset, i) {
                        //             var meta = chartInstance.controller.getDatasetMeta(i);
                        //             meta.data.forEach(function (bar, index) {
                        //                 var data = dataset.data[index];
                        //                 ctx.fillText(data, bar._model.x, bar._model.y - 5);
                        //             });
                        //         });
                        //     }
                        // }
                    }
                });
            }
        }

        const w = ref(window.innerWidth - 200);
        const h = ref(window.innerHeight - 160);
        const checkList = ref([]);

        const handleCheck = (s) => {
            let i = checkList.value.indexOf(s);
            if(i > -1){
                if(checkList.value.length >= 2){
                    checkList.value.splice(i, 1);
                    initChart();
                }
            }else{
                checkList.value.push(s);
                initChart();
            }
        };

        onMounted(() => {
            ctx = document.getElementById("adai-chart").getContext('2d');
            console.log(props.chartData);
            chartData.value = props.chartData;
            let list = [];
            props.chartData.label.forEach((ele) => {
                list.push(ele);
            });
            checkList.value = list || props.chartData.label || [props.chartData.label[0]];
            initChart();
        });

        return {
            close, chartType, w, h, chartData, borderColor, backgroundColor, handleCheck, checkList, lan,
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
        padding: 10px 50px;
        background: #fff;
        border-radius: 5px;
        min-width: 500px;
        box-shadow: 0 0 1px 1px #ddd;
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
    }
}
.content-box{
    position: relative;
}
.label-wrap{
    position: absolute;
    top: 5px;
    left: 0;
    width: 100%;
    height: 20px;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    .label-box{
        display: flex;
        align-items: center;
        font-size: 12px;
        cursor: pointer;
        margin-right: 10px;
        .check-box{
            width: 16px;
            height: 16px;
            // border: 1px solid #ddd;
            // border-radius: 3px;
            background: url('../assets/gou.svg') 50% 50% no-repeat;
            background-size: cover;
            &.active{
                // background: #358acd;
                // border: 1px solid #358acd;
                background: url('../assets/gou_a.svg') 50% 50% no-repeat;
                background-size: cover;
            }
        }
        .color{
            width: 40px;
            height: 10px;
            margin: 0 5px;
        }
    }
}
</style>