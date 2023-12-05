<template>
    <div class="pagination-wrap">
        <button class="button btn" :class="{active: page == 1}" @click="changePage(1)">{{lan['首页']}}</button>
        <button class="button btn margin-left-10" :class="{active: page == 1}" @click="changePage('prev')">{{lan['上一页']}}</button>
        <input class="input-page  margin-left-10" type="text" v-model="page" @keyup.enter="changePageEnter" :placeholder="lan['请输入页码']" />
        <i class="margin-left-10">{{pages}} {{lan['页']}}，{{lan['共']}} {{total}} {{lan['条记录']}}</i>
        <button class="button btn margin-left-10" :class="{active: page == pages || !pages}" @click="changePage('next')">{{lan['下一页']}}</button>
        <button class="button btn margin-left-10" :class="{active: page == pages || !pages}" @click="changePage(pages)">{{lan['末页']}}</button>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { createMsg, getLocalTime } from '../util/ADS';
export default {
    props:{
        defaultPage: Number,
        pages: Number,
        total: Number,
    },
    emits: ['change-page'],
    setup(props, context) {
        const { userKey, siteKey, code, lan } = toRefs(useState());
        const router = useRouter();
        const page = ref(1);

        const changePage = (i) => {
            if(i == 'prev'){
                if(page.value > 1){
                    page.value = Number(page.value) - 1;
                }else{
                    return;
                }
            }else if(i == 'next'){
                if(page.value < props.pages){
                    page.value = Number(page.value) + 1;
                }else{
                    return;
                }
            }else{
                if(i != page.value){
                    page.value = i;
                }else{
                    return;
                }
            }
            context.emit('change-page', Number(page.value));
        }

        const changePageEnter = () => {
            if(!(/^[1-9]\d*$/.test(page.value))){
                return createMsg(lan.value['请输入正整数']);
            }
            context.emit('change-page', Number(page.value));
        }

        watch(() => props.defaultPage, (nv, ov) => {
            page.value = nv;
        });

        onMounted(() => {
            page.value = props.defaultPage;
        });

        return {
            page, changePage, changePageEnter, lan, 
        }
    }
}
</script>
<style lang="scss" scoped>
.pagination-wrap{
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 20px;
    height: 40px;
    width: calc(100% - 40px);
    font-size: 14px;
    .btn{
        width: 60px;
        height: 20px;
        line-height: 20px;
        border-radius: 5px;
        &.active{
            background: #ddd;
        }
    }
    .input-page{
        width: 100px;
        height: 18px;
        line-height: 20px;
        border-radius: 5px;
        font-size: 14px;
    }
}
.margin-left-10{
    margin-left: 10px;
}
@media screen  and (max-width: 799px){
    .pagination-wrap{
        padding: 0 10px;
        width: calc(100% - 20px);
        font-size: 8px;
        .btn{
            &.active{
                background: #ddd;
            }
        }
        .input-page{
            width: 60px;
            font-size: 8px;
        }
    }
}
</style>