<template>
    <div class="edit-wrap">
        <div class="edit-box">
            <div class="edit-head">
                <div class="nav-wrap">
                    <span class="nav" :class="{active: nav === item.value}" v-for="(item, index) in navList" :key="index" @click="changeNav(item.value)">{{item.label}}</span>
                </div>
                <img class="close" @click="close" src="../assets/close.svg" alt="">
            </div>
            <div v-if="nav == 1" class="edit-content">
				<el-table
                    :data="tableData"
                    height="400"
                    border
                    style="width: 100%">
                        <el-table-column
                            prop="userName"
                            :label="lan['账号']"
                            width="180">
                        </el-table-column>
                        <el-table-column
                            prop="settlementActionO"
                            :label="lan['操作内容']">
                        </el-table-column>
                        <el-table-column
                            prop="timeO"
                            :label="lan['日期']"
                            width="180">
                        </el-table-column>
                </el-table>
            </div>
            <div v-if="nav == 2" class="edit-content">
				<el-table
                    :data="tableData"
                    height="400"
                    border
                    style="width: 100%">
                        <el-table-column
                            prop="orgName"
                            :label="lan['机构']"
                            width="100">
                        </el-table-column>
                        <el-table-column
                            prop="userName"
                            :label="lan['账号']"
                            width="100">
                        </el-table-column>
                        <el-table-column
                            prop="logO"
                            :label="lan['操作内容']">
                        </el-table-column>
                        <el-table-column
                            prop="timeO"
                            :label="lan['日期']"
                            width="180">
                        </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, getLocalTime, createMsg } from '../util/ADS';
import { supplierMS, org } from '../util/api';
export default {
    components: {
        
    },
    props:{
        vid: String,
    },
    emits: ['close'],
    setup(props, context) {
        const { userKey, siteKey, code, drive, device, lan } = toRefs(useState());
        const router = useRouter();

        const navList = ref([{'label': lan.value['卷册状态改动记录'], 'value': '1'}, {'label': lan.value['卷册信息改动记录'], 'value': '2'}]);
        const nav = ref('1');
        // 切换导航
        const changeNav = (i) => {
            nav.value = i;
            getVolumeLogList();
        }

        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = ref(100);

        const getVolumeLogList = async () => {
            tableData.value = [];
            const result = await supplierMS.getVolumeLogList({
                volumeKey: props.vid, 
                type: nav.value,
                page: page.value, 
                limit: limit.value, 
            });
            if(result.status == 200){
                tableData.value = result.data.list.map((ele) => {
                    ele.timeO = ele.time ? getLocalTime(ele.time) : '';
                    ele.settlementActionO = (ele.settlementAction || '') + ' ' + (ele.action || '');
                    ele.logO = (ele.logType || '')+' '+(ele.log || '');
                    return ele;
                });
                pages.value = result.data.pageNum;
                total.value = result.data.total;
            }else{
                createMsg(result.msg);
            }
        }

        const tableData = ref([]);

        onMounted(() => {
            getVolumeLogList();
        });
		
        const close = () => {
            context.emit('close', false);
        }

        return {
            close, lan, navList, nav, changeNav, tableData,
        }
    }
}
</script>
<style lang="scss" scoped>
.edit-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    .edit-box{
        position: relative;
        padding: 20px;
        background: #fff;
        border-radius: 5px;
        min-width: 700px;
        .edit-head{
            position: relative;
            width: 100%;
            height: 60px;
            display: flex;
            justify-content: space-between;
            text-align: center;
            .nav-wrap{
                position: relative;
                display: flex;
                align-items: center;
                .nav{
                    margin-right: 20px;
                    cursor: pointer;
                    &.active{
                        color: #358acd;
                        font-weight: bold;
                    }
                }
            }
            .close{
                position: absolute;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                background: #000;
                cursor: pointer;
            }
        }
        .edit-content{
            margin-top: 20px;
            li{
                margin-bottom: 20px;
                display: flex;
                align-items: center;
				input{
					width: 212px;
				}
                .label{
                    width: 160px;
                }
            }
        }
    }
}
</style>