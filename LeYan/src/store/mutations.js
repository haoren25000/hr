//定义state数据的修改操作
import * as types from './mutationsType'

const mutations = {
  [types.SET_RANK] (state, rank) {
    state.rank.monthRank = rank.monthRank;
    state.rank.totalRank = rank.totalRank;
    state.rank._id = rank._id;
  },
  [types.SET_SEARCH] (state, search) {
    state.search = search
  },
  [types.SET_BOOK] (state, book) {
    state.book.id = book._id;
    state.book.title = book.title;
    state.book.cover = book.cover
  }
};
export default mutations
