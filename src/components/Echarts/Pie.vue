<template>
    <div class="chart-wrap">
        <div class="chart-box">
            <div class="head-box">
                <div class="head-right">
                    <img class="close" @click="close" src="../../assets/close.svg" alt="">
                </div>
            </div>
            <div id="adai-chart"></div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted,  onUnmounted} from 'vue';
import { useState, changePropertyValue } from '../../store';

export default {
    props:{
        title: String,
        chartData: Object,
        subtitle: String, 
    },
    emits: ['close'],
    name: 'pie',
    setup(props, context) {
        const { userKey, siteKey, userRole, orgKey, lan } = toRefs(useState());
        const close = () => {
            context.emit('close', false);
        }

        let adaiChart, dom, option;

        const initChart = () => {
            adaiChart ? adaiChart.dispose() : null;
            adaiChart = null;

            adaiChart = echarts.init(dom, null, {
                renderer: 'canvas',
                useDirtyRect: false
            });

            option = {
                title: {
                    text: props.subtitle + ' ' + props.title,
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                },
                legend: {
                    y: 30
                },
                label: {
                    show: true,
                    formatter(param) {
                        // correct the percentage
                        return param.name + ' (' + param.percent + '%)';
                    }
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                series: [
                    {
                        type: 'pie',
                        radius: '50%',
                        data: props.chartData.data,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };

            if (option && typeof option === 'object') {
                adaiChart.setOption(option);
            }

            window.addEventListener('resize', adaiChart.resize);
        }

        onMounted(() => {
            dom = document.getElementById('adai-chart');
            // console.table(props.chartData);

            initChart();
        });

        onUnmounted(() => {
            adaiChart ? adaiChart.dispose() : null;
        });

        return {
            close, lan,
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