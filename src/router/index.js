import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../pages/Home.vue');
const BootPage = () => import('../pages/BootPage.vue');
const Supplier = () => import('../pages/Supplier.vue');
const ContractManage = () => import('../pages/ContractManage.vue');
const GenealogyStatistics = () => import('../pages/GenealogyStatistics.vue');
const ImageStatistics = () => import('../pages/ImageStatistics.vue');
const DeviceStatistics = () => import('../pages/DeviceStatistics.vue');
const MonthGather = () => import('../pages/MonthGather.vue');
const ImageGather = () => import('../pages/ImageGather.vue');
const YearGather = () => import('../pages/YearGather.vue');
const ToBeSettledVolumeList = () => import('../pages/ToBeSettledVolumeList.vue');
const TakeCameraBillList = () => import('../pages/TakeCameraBillList.vue');
const TakeCameraBillDetail = () => import('../pages/TakeCameraBillDetail.vue');
const OrgList = () => import('../pages/OrgList.vue');
const BaseSet = () => import('../pages/BaseSet.vue');
const BillApprovalProcess = () => import('../pages/BillApprovalProcess.vue');
const SystemLog = () => import('../pages/SystemLog.vue');
const GenealogyMonthReport = () => import('../pages/GenealogyMonthReport.vue');
const ImagesMonthReport = () => import('../pages/ImagesMonthReport.vue');
const CatalogMonthReport = () => import('../pages/CatalogMonthReport.vue');
const CatalogWorkloadSummary = () => import('../pages/CatalogWorkloadSummary.vue');
const CatalogSummary = () => import('../pages/CatalogSummary.vue');
const CatalogReport = () => import('../pages/CatalogReport.vue');
const BillMonthReport = () => import('../pages/BillMonthReport.vue');
const BillStatistics = () => import('../pages/BillStatistics.vue');
const Bill = () => import('../pages/Bill.vue');
const ImageRemarkReport = () => import('../pages/ImageRemarkReport.vue');
const CatalogEditReport = () => import('../pages/CatalogEditReport.vue');
const SupplierMonthSubmit = () => import('../pages/SupplierMonthSubmit.vue');
const SupplierContribution = () => import('../pages/SupplierContribution.vue');
const MonthVolumeSubmit = () => import('../pages/MonthVolumeSubmit.vue');

const routes = [
    { 
        path: '/', 
        name: 'BootPage',
        component: BootPage,
        props: true,
    },
    { 
        path: '/MonthVolumeSubmit', 
        name: 'MonthVolumeSubmit',
        component: MonthVolumeSubmit,
        props: true,
    },
    { 
        path: '/SupplierContribution', 
        name: 'SupplierContribution',
        component: SupplierContribution,
        props: true,
    },
    { 
        path: '/SupplierMonthSubmit', 
        name: 'SupplierMonthSubmit',
        component: SupplierMonthSubmit,
        props: true,
    },
    { 
        path: '/catalogEditReport', 
        name: 'CatalogEditReport',
        component: CatalogEditReport,
        props: true,
    },
    { 
        path: '/imageRemarkReport', 
        name: 'ImageRemarkReport',
        component: ImageRemarkReport,
        props: true,
    },
    { 
        path: '/catalogSummary', 
        name: 'CatalogSummary',
        component: CatalogSummary,
        props: true,
    },
    { 
        path: '/catalogWorkloadSummary', 
        name: 'CatalogWorkloadSummary',
        component: CatalogWorkloadSummary,
        props: true,
    },
    { 
        path: '/catalogReport', 
        name: 'CatalogReport',
        component: CatalogReport,
        props: true,
    },
    { 
        path: '/catalogMonthReport', 
        name: 'CatalogMonthReport',
        component: CatalogMonthReport,
        props: true,
    },
    { 
        path: '/billStatistics', 
        name: 'BillStatistics',
        component: BillStatistics,
        props: true,
    },
    { 
        path: '/billMonthReport', 
        name: 'BillMonthReport',
        component: BillMonthReport,
        props: true,
    },
    { 
        path: '/bill', 
        name: 'Bill',
        component: Bill,
        props: true,
    },
    { 
        path: '/imagesMonthReport', 
        name: 'imagesMonthReport',
        component: ImagesMonthReport,
        props: true,
    },
    { 
        path: '/genealogyMonthReport', 
        name: 'genealogyMonthReport',
        component: GenealogyMonthReport,
        props: true,
    },
    { 
        path: '/supplier', 
        name: 'supplier',
        component: Supplier,
        props: true,
    },
    { 
        path: '/contractManage', 
        name: 'contractManage',
        component: ContractManage,
        props: true,
    },
    { 
        path: '/genealogyStatistics', 
        name: 'genealogyStatistics',
        component: GenealogyStatistics,
        props: true,
    },
    { 
        path: '/imageStatistics', 
        name: 'imageStatistics',
        component: ImageStatistics,
        props: true,
    },
    { 
        path: '/deviceStatistics', 
        name: 'deviceStatistics',
        component: DeviceStatistics,
        props: true,
    },
    { 
        path: '/monthGather', 
        name: 'monthGather',
        component: MonthGather,
        props: true,
    },
    { 
        path: '/imageGather', 
        name: 'imageGather',
        component: ImageGather,
        props: true,
    },
    { 
        path: '/yearGather', 
        name: 'yearGather',
        component: YearGather,
        props: true,
    },
    { 
        path: '/boBeSettledVolumeList', 
        name: 'boBeSettledVolumeList',
        component: ToBeSettledVolumeList,
        props: true,
    },
    { 
        path: '/takeCameraBillList', 
        name: 'takeCameraBillList',
        component: TakeCameraBillList,
        props: true,
    },
    { 
        path: '/takeCameraBillDetail', 
        name: 'takeCameraBillDetail',
        component: TakeCameraBillDetail,
        props: true,
    },
    { 
        path: '/orgList', 
        name: 'orgList',
        component: OrgList,
        props: true,
    },
    { 
        path: '/baseSet', 
        name: 'baseSet',
        component: BaseSet,
        props: true,
    },
    { 
        path: '/billApprovalProcess', 
        name: 'billApprovalProcess',
        component: BillApprovalProcess,
        props: true,
    },
    { 
        path: '/systemLog', 
        name: 'systemLog',
        component: SystemLog,
        props: true,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router