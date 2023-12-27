import axios from 'axios';
import { createMsg } from './ADS';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();

let baseURL='https://pumudata.qingtime.cn';
baseURL = 'https://genealogydatatest.qingtime.cn';

if(window.location.origin.indexOf('suppliersys.1jiapu.com') > -1){
    baseURL = 'https://genealogydata.1jiapu.com';
}

// baseURL = 'https://genealogydata.1jiapu.com';

axios.interceptors.response.use(
    (response) => {
        switch (response.data.statusCode || response.data.status) {
            case '701':
                localStorage.clear()
                createMsg('登录失效');
                break
            case '201':
                createMsg(response.data.msg)
                break
            default:
        }

        return response
    },
    (err) => {
      console.log(err)
    }
)

const request = {
    get: (url, params, base = '') => {
        return new Promise((resolve, reject) => {
            axios
            .get((base ? base : baseURL)+url, {params})
            .then((response) => {
                resolve(response.data);
                if(response.data.status == 301){// 验证码失效 => 跳转 验证码校验UI 2022.07.02 -> baolf
                    createMsg(response.data.msg);
                    router.push('/authentication');
                }
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            })
        })
    },
    post: (url, params, base) => {
        return new Promise((resolve, reject) => {
            axios
            .post((base ? base : baseURL)+url, params)
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    patch: (url, params) => {
        return new Promise(function(resolve, reject) {
            axios
            .patch(baseURL+url, params)
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    delete: (url, params) => {
        return new Promise(function(resolve, reject) {
            axios
            .delete(baseURL+url, {
                data: params
            })
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    }
}

const user = {
    getUserInfo(token){
        let param = {
            token: token
        }
        return request.get('/sgbh/account/userinfo', param, 'https://baokudata.qingtime.cn');
    },
    userAndStarInfoAndRole(token, starKey){
        let param = {
            token: token,
            starKey: starKey,
        }
        return request.post('/sgbh/star/userAndStarInfoAndRole', param, 'https://kintime.qingtime.cn');
    },
    saveUser(userRole, token, userKey, userName, mobile, siteKey, siteName, siteLogo, userAvatar, rooterId){
        let param = {
            'userRole': userRole, 
            'token': token, 
            'userKey': userKey, 
            'userName': userName, 
            'mobile': mobile, 
            'siteKey': siteKey, 
            'siteName': siteName, 
            'siteLogo': siteLogo, 
            'userAvatar': userAvatar, 
            'rooterId': rooterId
        }
        return request.post('/user', param);
    },
    getRoleUserList(param){// 获取角色对应的人员
        return request.get('/roleUserList', param);
    },
}

const org = {
    getOrgList(siteKey, name){
        let param = {
            name: name,
            siteKey: siteKey
        }
        return request.get('/org', param);
    },
    patchOrg(orgKey, patchData){
        let param = {
            orgKey: orgKey,
            patchData: patchData
        }
        return request.patch('/org', param);
    },
    getOrgMemberInfo(siteKey, userKey){
        let param = {
            siteKey: siteKey,
            userKey: userKey
        }
        return request.get('/org/member/info', param);
    },
}

const upload = {
    uploadFile(fd){
        return request.post('/upload', fd);
    }
}

const supplierMS = {
    getHomePage(userKey, siteKey){// 系统首页统计数据
        let param = {
            userKey: userKey,
            siteKey: siteKey
        }
        return request.get('/supplierMS/homePage', param);
    },
    getContractList(userKey, siteKey, orgKey, startTime, endTime, page, limit){// 合同列表
        let param = {
            userKey: userKey,
            siteKey: siteKey,
            orgKey: orgKey,
            startTime: startTime,
            endTime: endTime,
            page: page,
            limit: limit
        }
        return request.get('/supplierMS/contractList', param);
    },
    addContract(param){// 创建合同
        return request.post('/supplierMS/contract', param);
    },
    editContract(contracKey, siteKey, patchData){// 编辑合同
        let param = {
            contracKey: contracKey,
            siteKey: siteKey,
            patchData: patchData
        }
        return request.patch('/supplierMS/contract', param);
    },
    deleteContract(contracKey, siteKey){// 删除合同
        let param = {
            contracKey: contracKey,
            siteKey: siteKey
        }
        return request.delete('/supplierMS/contract', param);
    },
    getGcVerifyDetail(orgKey, siteKey, startTime, endTime, page, limit){// 谱目审核明细
        let param = {
            orgKey: orgKey,
            siteKey: siteKey,
            startTime: startTime,
            endTime: endTime,
            page: page,
            limit: limit
        }
        return request.get('/supplierMS/gcVerifyDetail', param);
    },
    gcVerifyDetailTotal(orgKey, siteKey, startTime, endTime, page, limit){// 谱目审核明细总计
        let param = {
            orgKey: orgKey,
            siteKey: siteKey,
            startTime: startTime,
            endTime: endTime,
            page: page,
            limit: limit
        }
        return request.get('/supplierMS/gcVerifyDetailTotal', param);
    },
    getImageVerifyDetail(orgKey, siteKey, genealogyName, catalogKey, condition, startTime, endTime, uploadStartTime, uploadEndTime, firstSubmitStartTime, firstSubmitEndTime, status, page, limit){// 影像审核明细
        let param = {
            orgKey: orgKey,
            siteKey: siteKey,
            genealogyName: genealogyName,
            catalogKey: catalogKey,
            condition: condition,
            startTime: startTime,
            endTime: endTime,
            uploadStartTime: uploadStartTime,
            uploadEndTime: uploadEndTime,
            firstSubmitStartTime: firstSubmitStartTime,
            firstSubmitEndTime: firstSubmitEndTime,
            status: status, 
            page: page,
            limit: limit
        }
        return request.get('/supplierMS/imageVerifyDetail', param);
    },
    getimageVerifyDetailDownload(param){// 影像审核明细 - 下载
        return request.get('/supplierMS/imageVerifyDetailDownload', param);
    },
    imageVerifyDetailTotal(orgKey, siteKey, genealogyName, catalogKey, condition, startTime, endTime, uploadStartTime, uploadEndTime, firstSubmitStartTime, firstSubmitEndTime, status, page, limit){// 影像审核明细总计
        let param = {
            orgKey: orgKey,
            siteKey: siteKey,
            genealogyName: genealogyName,
            catalogKey: catalogKey,
            condition: condition,
            startTime: startTime,
            endTime: endTime,
            uploadStartTime: uploadStartTime,
            uploadEndTime: uploadEndTime,
            firstSubmitStartTime: firstSubmitStartTime,
            firstSubmitEndTime: firstSubmitEndTime,
            status: status, 
            page: page,
            limit: limit
        }
        return request.get('/supplierMS/imageVerifyDetailTotal', param);
    },
    getDevicePageStatistics(orgKey, siteKey, startTime, endTime, type, page, limit){// 拍机拍摄数量汇总
        let param = {
            orgKey: orgKey,
            siteKey: siteKey,
            startTime: startTime,
            endTime: endTime,
            type: type,
            page: page,
            limit: limit
        }
        return request.get('/supplierMS/devicePageStatistics', param);
    },
    getMonthlySummary(startTime, endTime, orgKey, siteKey, typeTime){// 月份汇总表（新谱提交
        let param = {
            orgKey: orgKey,
            siteKey: siteKey,
            startTime: startTime,
			endTime: endTime,
            typeTime: typeTime,
        }
        return request.get('/supplierMS/monthlySummary', param);
    },
    getShootingCompletion(param){// 拍摄完成度
        // let param = {
        //     orgKey: orgKey,
        //     siteKey: siteKey,
        //     startTime: startTime,
        //     endTime: endTime
        // }
        return request.get('/supplierMS/shootingCompletion', param);
    },
    getAnnualTaskCompletion(startTime, endTime, orgKey, siteKey){// 年度任务完成度
        let param = {
            orgKey: orgKey,
            siteKey: siteKey,
            startTime: startTime,
            endTime: endTime
        }
        return request.get('/supplierMS/annualTaskCompletion', param);
    },
    // 拍机单价
    addPrice(year, isLeadImages, singleOrTwo, price, orgKey){// 增加拍机单价
        let param = {
            year: year,
            isLeadImages: isLeadImages,
            singleOrTwo: singleOrTwo,
            price: price,
            orgKey: orgKey,
        }
        return request.post('/supplierMS/price', param);
    },
    deletePrice(priceKey){// 删除拍机单价
        let param = {
            priceKey: priceKey
        }
        return request.delete('/supplierMS/price', param);
    },
    editPrice(priceKey, patchData){// 编辑拍机单价
        let param = {
            priceKey: priceKey,
            patchData: patchData
        }
        return request.patch('/supplierMS/price', param);
    },
    getPrice(){// 查询拍机单价
        let param = {
            
        }
        return request.get('/supplierMS/price', param);
    },
    // 机构年度任务
    addOrgTask(year, orgKey, taskNumber, annualBudget){// 增加机构年度任务
        let param = {
            year: year,
            orgKey: orgKey,
            taskNumber: taskNumber,
            annualBudget: annualBudget,
        }
        return request.post('/supplierMS/orgTask', param);
    },
    deleteOrgTask(taskKey){// 删除机构年度任务
        let param = {
            taskKey: taskKey
        }
        return request.delete('/supplierMS/orgTask', param);
    },
    editOrgTask(taskKey, patchData){// 编辑机构年度任务
        let param = {
            taskKey: taskKey,
            patchData: patchData
        }
        return request.patch('/supplierMS/orgTask', param);
    },
    getOrgTask(orgKey){// 查询机构年度任务
        let param = {
            orgKey: orgKey
        }
        return request.get('/supplierMS/orgTask', param);
    },
    // 发票审批流程
    addApprovalUser(siteKey, approvalNo, nodeName, userKey, email, amount){// 增加发票审批流程
        let param = {
            siteKey: siteKey,
            approvalNo: approvalNo,
            nodeName: nodeName,
            userKey: userKey,
            email: email,
            amount: amount,
        }
        return request.post('/supplierMS/approvalUser', param);
    },
    deleteApprovalUser(dataKey){// 删除发票审批流程
        let param = {
            dataKey: dataKey
        }
        return request.delete('/supplierMS/approvalUser', param);
    },
    editApprovalUser(dataKey, patchData){// 编辑发票审批流程
        let param = {
            dataKey: dataKey,
            patchData: patchData
        }
        return request.patch('/supplierMS/approvalUser', param);
    },
    getApprovalUser(siteKey){// 查询发票审批流程
        let param = {
            siteKey: siteKey
        }
        return request.get('/supplierMS/approvalUser', param);
    },
    // 获取微站的超管/管理员/编辑列表
    siteRootAndAdminAndEdit(siteKey){
        let param = {
            siteKey: siteKey
        }
        return request.get('/supplierMS/siteRootAndAdminAndEdit', param);
    },
    // 获取待结算列表
    toBeSettled(param){
        return request.get('/supplierMS/toBeSettled', param);
    },
    // 开发票
    addBill(userKey, orgKey, isAllSelect, volumeKeyArr, siteKey, startTime, endTime){
        let param = {
            userKey: userKey,
            orgKey: orgKey,
            isAllSelect: isAllSelect,
            volumeKeyArr: volumeKeyArr,
            siteKey: siteKey,
            startTime: startTime,
            endTime: endTime,
        }
        return request.post('/supplierMS/bill', param);
    },
    addBillFoxx(param){// 开发票
        // let param = {
        //     userKey: userKey,
        //     orgKey: orgKey,
        //     isAllSelect: isAllSelect,
        //     volumeKeyArr: volumeKeyArr,
        //     siteKey: siteKey,
        //     startTime: startTime,
        //     endTime: endTime,
        //     takeStatus: takeStatus,
        // }
        return request.post('/lhpmfoxx/bill/drawBill', param);
    },
    toBeSettledResidueTotal(param){// 待结算剩余统计
        return request.post('/supplierMS/toBeSettledResidueTotal', param);
    },
    // 发票详情
    getBillDetail(dataKey){
        let param = {
            dataKey: dataKey
        }
        return request.get('/supplierMS/bill', param);
    },
    getBillDetailList(billKey, summaryKey){
        let param = {
            billKey: billKey,
            summaryKey: summaryKey
        }
        return request.get('/supplierMS/billDetail', param);
    },
    // 获取发票审批流程详情
    billApprovalProcess(dataKey, userKey){
        let param = {
            dataKey: dataKey,
            userKey: userKey
        }
        return request.get('/supplierMS/billApprovalProcess', param);
    },
    // 审批发票
    approvalBill(dataKey, userKey, siteKey, status, approvalOpinion){
        let param = {
            dataKey: dataKey,
            userKey: userKey,
            siteKey: siteKey,
            status: status,
            approvalOpinion: approvalOpinion
        }
        return request.post('/supplierMS/approvalBill', param);
    },
    // 获取发票列表
    getBillList(orgKey, startTime, endTime, status, approvalStatus, page, limit){
        let param = {
            orgKey: orgKey,
            startTime: startTime, 
            endTime: endTime,
            status: status,
            approvalStatus: approvalStatus, 
            page: page, 
            limit: limit
        }
        return request.get('/supplierMS/billList', param);
    },
    // 新增日志
    addLog(log, logType, userKey, orgKey = '', siteKey = ''){
        let param = {
            log: log,
            logType: logType, 
            userKey: userKey,
            orgKey: orgKey,
            siteKey: siteKey
        }
        return request.post('/supplierMS/addLog', param);
    },
    // 日志列表
    logList(startTime, endTime, logType, userKey, orgKey, page, limit){
        let param = {
            startTime: startTime,
            endTime: endTime,
            logType: logType, 
            userKey: userKey,
            orgKey: orgKey,
            page: page,
            limit: limit
        }
        return request.get('/supplierMS/logList', param);
    },
    monthlySummaryOrg(startTime, endTime, type, typeTime){// 查重月度报告（各机构统计）
        let param = {
            startTime: startTime,
            endTime: endTime,
            type: type,
            typeTime: typeTime,
        }
        return request.get('/supplierMS/monthlySummaryOrg', param);
    },
    imageMonthSummaryOrg(firstSubmitStartTime, firstSubmitEndTime, uploadStartTime, uploadEndTime, startTime, endTime, typeStatus){// 影像月度汇总（各机构统计）
        let param = {
            firstSubmitStartTime: firstSubmitStartTime,
            firstSubmitEndTime: firstSubmitEndTime,
            uploadStartTime: uploadStartTime,
            uploadEndTime: uploadEndTime,
            startTime: startTime,
            endTime: endTime,
            typeStatus: typeStatus,
        }
        return request.get('/supplierMS/imageMonthSummaryOrg', param);
    },
    monthlySummaryList(timeStr, createStartTime, createEndTime, condition, orgKey, sortField, sortType, page, limit){// 查重月份汇总表明细列表
        let param = {
            timeStr: timeStr,
            createStartTime: createStartTime,
            createEndTime: createEndTime,
            condition: condition,
            orgKey: orgKey,
            sortField: sortField,
            sortType: sortType,
            page: page,
            limit: limit,
        }
        return request.get('/supplierMS/monthlySummaryList', param);
    },
    shootingCompletionList(timeStr, orgKey, page, limit){// 拍摄月度汇总明细列表
        let param = {
            timeStr: timeStr,
            orgKey: orgKey,
            page: page,
            limit: limit,
        }
        return request.get('/supplierMS/shootingCompletionList', param);
    },
    settledBillStatistics(param){// 发票月度汇总（已完成）
        return request.get('/supplierMS/settledBillStatistics', param);
    },
    settledBillStatisticsDetail(param){//结算发票统计明细（已完结）
        return request.get('/supplierMS/settledBillStatisticsDetail', param);
    },
    settledBillStatisticsTotal(param){// 结算发票汇总（已完结）
        return request.get('/supplierMS/settledBillStatisticsTotal', param);
    },
    settledBillStatisticsDownload(param){// 结算发票统计和明细下载（已完结）
        return request.get('/supplierMS/settledBillStatisticsDownload', param);
    },
    settledBillStatisticsDetailDownload(param){// 结算发票明细下载（已完结）
        return request.get('/supplierMS/settledBillStatisticsDetailDownload', param);
    },
    toBeSettledDownload(param){// 结算列表明细下载
        return request.get('/supplierMS/toBeSettledDownload', param);
    },
    toBeSettledTotal(param){// 获取待结算总计
        // let param = {
        //     orgKey: orgKey,
        //     siteKey: siteKey,
        //     genealogyName: genealogyName,
        //     volumeNumber: volumeNumber,
        //     startTime: startTime,
        //     endTime: endTime,
        //     settlementStatus: settlementStatus,
        //     takeStatus: takeStatus,
        //     gcKey: gcKey,
        //     volumeKey: volumeKey,
        // }
        return request.get('/supplierMS/toBeSettledTotal', param);
    },
    billTotal(orgKey, siteKey, startTime, endTime, approvalStatus, status){// 获取发票总计
        let param = {
            orgKey: orgKey,
            siteKey: siteKey,
            startTime: startTime,
            endTime: endTime,
            approvalStatus: approvalStatus,
            status: status,
        }
        return request.get('/supplierMS/billTotal', param);
    },
    restoreBill(dataKey, approvalOpinion, userKey, siteKey){// 重置发票
        let param = {
            dataKey: dataKey,
            approvalOpinion: approvalOpinion,
            userKey: userKey,
            siteKey: siteKey
        }
        return request.patch('/supplierMS/restoreBill', param);
    },
    paidBill(siteKey, userKey, dataKey, memo, type){// 已付款已收款 1 已付款 2 已收款
        let param = {
            dataKey: dataKey,
            memo: memo,
            type: type,
            userKey: userKey,
            siteKey: siteKey
        }
        return request.patch('/supplierMS/paidBill', param);
    },
    voidedBill(siteKey, userKey, dataKey, memo){// 已确认发票作废（微站超管管理员）
        let param = {
            dataKey: dataKey,
            memo: memo,
            userKey: userKey,
            siteKey: siteKey
        }
        return request.patch('/supplierMS/voidedBill', param);
    },
    nonSettlementVolume(siteKey, userKey, orgKey, volumeKeyArray, status){// 不可结算或者取消 status 0 取消 1 不可结算
        let param = {
            orgKey: orgKey,
            userKey: userKey,
            volumeKeyArray: volumeKeyArray,
            status: status,
            siteKey: siteKey,
        }
        return request.patch('/supplierMS/nonSettlementVolume', param);
    },
    updateVolume2Status(param){// 修改卷册属性或者状态（分别加日志）
        return request.patch('/v3/review/catalog/updateVolume2Status', param);
    },
    getVolumeLogList(param){// 获取卷册日志（属性或者状态）
        return request.get('/v3/review/volumeLogList', param);
    },
    GCOverStatistics(param){//編目檢核（年/月/週）度匯總
        return request.get('/supplierMS/GCOverStatistics', param);
    },
    GCOverStatisticsAllOrg(param){// 編目檢核月度汇总（各机构统计）
        return request.get('/supplierMS/GCOverStatisticsAllOrg', param);
    },
    GCOverWorkStatistics(param){// 編目完结（月/週/日）工作量统计
        return request.get('/supplierMS/GCOverWorkStatistics', param);
    },
    GCOverStatisticsAllOrgSingleData(param){// 編目完结（月/週/日）（各机构统计）单数据
        return request.get('/supplierMS/GCOverStatisticsAllOrgSingleData', param);
    },
    getLogType(param){// 日志类型
        return request.get('/supplierMS/logType', param);
    },
    getDeductionAmount(param){// 获取扣款金额
        return request.post('/supplierMS/getDeductionAmount', param);
    },
    deductionBill(param){// 发票扣款
        return request.post('/supplierMS/deductionBill', param);
    },
    errorCausesAnalysis(param){// 影像准确率 日/周/月
        return request.post('/supplierMS/errorCausesAnalysis', param);
    },
    GCOverAnalysisArray(param){// 编目分析（月/週/日）度匯總（数组）
        return request.post('/supplierMS/GCOverAnalysisArray', param);
    },
    supplierMonthSubmitCount(param){// 供应商月提交量（影像页数/adj影像页数）type 1 影像页数 2 adj影像页数
        return request.post('/supplierMS/supplierMonthSubmitCount', param);
    },
    supplierMonthContribution(param){// 供应商月贡献度（影像页数/adj影像页数）type 1 影像页数 2 adj影像页数
        return request.post('/supplierMS/supplierMonthContribution', param);
    },
    supplierMonthCheck(param){// 供应商月谱书即时审核状态
        return request.post('/supplierMS/supplierMonthCheck', param);
    },
    supplierImageAmount(param){// 供应商拍数金额统计
        return request.post('/supplierMS/supplierImageAmount', param);
    },
    getHomePageYear(param){// 首页（年统计）
        return request.get('/supplierMS/homePageYear', param);
    },
    getPriceListDistinct(param){// 获取价格列表（去重）
        return request.get('/supplierMS/getPriceListDistinct', param);
    },
}

export {
    supplierMS, user, org, upload
}