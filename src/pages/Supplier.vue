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
                <li v-for="(item, index) in todo" :key="index" @click="goRouter(index)">
                    <p>{{lan[item.name]}}:</p>
                    <span>{{item.count}}</span>
                </li>
            </ul>
        </div>
        <div class="supplier-foot">
            <h3 class="title">{{lan['数据汇总']}}</h3>
            <ul class="data-count">
                <li v-for="(item, index) in dataCount" :key="index">
                    <img class="chart" :src="item.img" alt="">
                    <div class="data-box">
                        <p>{{lan[item.name]}}</p>
                        <span>{{item.count}}</span>
                    </div>
                </li>
            </ul>
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
            {'name': '影像待审核', 'count': 0},
            {'name': '待结算发票', 'count': 0},
            // {'name': '家谱索引待审核', 'count': 0},
            // {'name': '家谱索引待结算', 'count': 0}
        ]);

        const dataCount = ref([
            {'name': '谱目总数', 'count': 0, 'img': total},
            {'name': '影像页数', 'count': 0, 'img': images},
            {'name': '影像支出', 'count': 0, 'img': amount},
            {'name': '影像机构', 'count': 0, 'img': org},
            // {'name': '数字化节点', 'count': 0},
            // {'name': '数字化支出', 'count': 0},
            // {'name': '数字化机构', 'count': 0}
        ]);

        const UP = ref(0.18);
        const currencySign = ref('$');

        const getHomePage = async () => {
            // changePropertyValue('isLoading', true);
            const result = await supplierMS.getHomePage(userKey.value, siteKey.value);
            // changePropertyValue('isLoading', false);
            if(result.status == 200){
                todo.value.forEach((ele, i) => {
                    if(i === 0){
                        ele.count = thousands(result.data.waitReviewCount);
                    }
                    if(i === 1){
                        ele.count = thousands(result.data.waitSettlementCount);
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
                        ele.count = '$'+thousands(result.data.totalAmount || 0);
                    }
                    if(i === 3){
                        ele.count = thousands(result.data.allImageOrgCount - 1);
                    }
                });
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
            if(i == 1){
                router.push(userRole.value >= 1 && userRole.value <= 3 ? '/takeCameraBillList' : '/boBeSettledVolumeList');
            }else{
                // createMsg('请去家谱查重系统审核', true);
            }
        }

        return {
            todo, dataCount, language, lan, sidebarW, goRouter, 
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
        margin-right: 200px;
        display: flex;
        align-items: center;
        span{
            font-size: 20px;
            color: #358acd;
            margin-left: 10px;
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
</style>