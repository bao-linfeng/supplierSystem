<template>
    <div class="process-wrap">
        <div class="process-box">
            <div class="process" :style="{width: (100*imageI/l)+'%'}"></div>
            <i>{{imageI}}/{{l}}</i>
        </div>
        <img class="close" src="../assets/close.svg" @click="close" alt="">
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue'
export default {
    props:{
        imageI: Number,
        l: Number,
    },
    setup(props, context) {
        const close = () => {
            context.emit('close', false);
        }
        return {
            close
        }
    }
}
</script>
<style lang="scss" scoped>
.process-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 30px;
    width: 90%;
    background-color: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    font-size: 12px;
    .process-box{
        position: relative;
        width: 100%;
        background: #fff;
        border-radius: 10px;
        height: 20px;
        overflow: hidden;
        .process{
            position: absolute;
            top: 0;
            left: 0;
            width: 20px;
            height: 100%;
            background: #85b83e;
        }
        i{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-style: normal;
            color: #358acd;
        }
    }
    .close{
        position: absolute;
        top: calc(50% - 25px);
        right: 30px;
        transform: translateY(-50%);
        cursor: pointer;
    }
}
</style>