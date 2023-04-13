<template>
    <teleport to="#modal">
        <div class="mask-layer">
            <img class="loading" src="../assets/loading.gif" alt="" />
        </div>
    </teleport>
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
.mask-layer{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
	z-index: 1000;
	.loading{
		height: 100px;
	}
}
</style>