import { reactive, inject } from 'vue';
import {getValue} from '../util/ADS';

const stateSymbol = Symbol('state');

const state = reactive({ 
  token: getValue('token') || '',
  userKey: getValue('userKey') || '',
  userName: getValue('userName') || '',
  profile: getValue('profile') ? JSON.parse(getValue('profile')) : {},
  avatar: getValue('avatar') || '',
  userRole: getValue('userRole') || 99,
  siteKey: '1528234980',
  origin: window.location.origin || '',
  navActive: '/',
  baseURL: window.location.origin.indexOf('suppliersys.1jiapu.com') > -1 ? 'https://genealogydata.1jiapu.com' : 'https://genealogydatatest.qingtime.cn',
  isLoading: false,
  orgName: getValue('orgName') || '',
  orgKey: getValue('orgKey') || '',
  admin: getValue('admin') || '',
  lan: {},
  lanType: 'zh',
  sidebarW: 260,
  billStatusO: {
    0: '待审批',
    1: '审批中',
    2: '已确认',
    3: '已驳回',
    4: '已付款',
    5: '已收款',
    6: '已作废',
  },
});

const changePropertyValue = (property, value) => {
  state[property] = value;
}

const changeUserInfo = (property, value) => {
  state.userInfo[property] = value;
}

const useState = () => inject(stateSymbol);

export {
  stateSymbol,state,useState,changePropertyValue,changeUserInfo
}