<template>
    <div class="fireworks-wrap">
        <img class="fireworks f-1" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-2" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-3" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-4" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-5" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-6" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-7" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-8" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-9" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-10" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-11" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-12" src="../assets/BootPage/fireworks.png" alt="" />
        <img class="fireworks f-13" src="../assets/BootPage/fireworks.png" alt="" />
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject } from 'vue'
export default {
    props:{
        
    },
    setup(props) {
        
        return {
            
        }
    }
}
</script>
<style lang="scss" scoped>
.fireworks-wrap{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    animation: moveTop 5s linear 1 forwards;
    overflow: hidden;
    pointer-events: none;
    .fireworks{
        position: absolute;
        height: 139px;
        &.f-1{
            bottom: 200px;
            left: 150px;
        }
        &.f-2{
            bottom: 339px;
            left: 250px;
        }
        &.f-3{
            bottom: 150px;
            left: 300px;
        }
        &.f-4{
            bottom: 5px;
            left: 300px;
        }
        &.f-5{
            bottom: 480px;
            left: 380px;
        }
        &.f-6{
            bottom: 100px;
            left: 440px;
        }
        &.f-7{
            bottom: 200px;
            right: 150px;
        }
        &.f-8{
            bottom: 339px;
            right: 250px;
        }
        &.f-9{
            bottom: 150px;
            right: 300px;
        }
        &.f-10{
            bottom: 5px;
            right: 300px;
        }
        &.f-11{
            bottom: 480px;
            right: 380px;
        }
        &.f-12{
            bottom: 100px;
            right: 440px;
        }
        &.f-13{
            bottom: 0;
            left: 955px;
        }
    }
}
@keyframes moveTop{
    from {
        bottom: 0px;
    }
    to {
        bottom: 100%;
    }
}
</style>