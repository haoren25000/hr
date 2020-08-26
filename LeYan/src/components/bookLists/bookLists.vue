<template>
  <div class="bookLists">

    <m-header></m-header>

    <div class="select">
      <ul class="select-bar">
        <li
          v-for="(item,index) in largeTypes"
          :key="index"
          :class="{'active':index===largeTypeIndex}"
          @click="setLargeType(item.type,index,item.duration)"
        >{{item.name}}</li>
      </ul>
      <ul class="select-bar">
        <li
          v-for="(item,index) in smallTypes"
          :key="index"
          :class="{'active':index===smallTypeIndex}"
          @click="setSmallType(item.minor,index)"
        >{{item.name}}</li>
      </ul>
    </div>

    <div class="load-more">
      <mt-loadmore
        class="loadmore"
        :top-method="loadTop"
        ref="loadmore"
        :auto-fill="false"
        :bottom-all-loaded="allLoaded"
      >
        <div class="book-list">
          <book-list
            :book="book"
            v-for="book in bookLists"
            :key="book._id"
            :isBookList="isBookList"
            :isLoadMore="isLoadMore"
          ></book-list>
        </div>
      </mt-loadmore>
    </div>

    <router-view></router-view>
  </div>
</template>
<script type="text/ecmascript-6">
import BookList from "common/book-list";
import { Indicator } from "mint-ui";
import { bookLists } from "../../api/api";

export default {
  data() {
    return {
      largeTypeIndex: 0,
      smallTypeIndex: 0,
      type: "collectorCount",
      duration: "last-seven-days",
      minor: "",
      gender: "",
      start: 0,
      currentPage: 1,
      largeTypes: [
        {
          type: "collectorCount",
          name: "本周最热",
          duration: "last-seven-days",
        },
        {
          type: "created",
          name: "最新发布",
          duration: "all",
        },
        {
          type: "collectorCount",
          name: "最多收藏",
          duration: "all",
        },
      ],
      smallTypes: [
        {
          minor: "",
          name: "全部",
        },
        {
          minor: "male",
          name: "男生",
        },
        {
          minor: "female",
          name: "女生",
        },
      ],
      bookLists: [],
      allLoaded: false,
      isBookList: true,
      isLoadMore: false,
    };
  },
  created() {
    this._getBookLists(this.type, this.duration, this.start, this.gender);
  },
  methods: {
    //获取全部类型
    setLargeType(type, index, duration) {
      this.largeTypeIndex = index;
      this.type = type;
      this.duration = duration;
      this._getBookLists(this.type, this.duration, this.start, this.gender);
    },
    //获取男女类型
    setSmallType(minor, index) {
      this.smallTypeIndex = index;
      this.minor = minor;
      this.gender = "&gender=" + minor;
      this.currentPage = 1;
      this._getBookLists(this.type, this.duration, this.start, this.gender);
    },

    //获取对应类型book数据
    _getBookLists(type, dur, start, gender) {
      Indicator.open("加载中");
      bookLists(type, dur, start, gender).then(
        (res) => {
          if(res.data.ok){
            this.bookLists = this._unEscape(
              this.normalizeBooks(res.data.bookLists)
            );
            
            Indicator.close();
          }
        },
        (error) => {
          Indicator.close();
          Indicator.open("网络错误");
          setTimeout(() => {
            Indicator.close();
          }, 1500);
        }
      );
    },
    //将数据里cover图片数据进行解码
    _unEscape(arr) {
      for (let i = 0; i < arr.length; i++) {
        arr[i].cover = unescape(arr[i].cover);
        arr[i].cover = arr[i].cover.replace("/agent/", "");
      }
      return arr;
    },
    //下拉加载
    loadTop() {
      //重新调用
      this._getBookLists(this.type, this.duration, this.start, this.gender);
      //用于重新定位
      this.$refs.loadmore.onTopLoaded();
    },
  },

  //引入子组件
  components: {
    BookList,
  },
};
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
.bookLists {
  .book-header, .select {
    position: absolute;
    top: 174px;
    left: 0;
    background: #fff;
    z-index: 10;
    width: 100%;
  }

  .select-bar {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: nowrap;
    height: 100px;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    border-bottom: 1px solid #f2f2f2;
  }

  .select-bar li {
    flex-shrink: 0;
    line-height: 100px;
    padding: 0 50px;
    font-size: 25px;
  }

  .active {
    color: red;
  }

  .book-list {
    width: 100%;
    background: #fff;
  }

  .load-more {
    padding-top: 200px;
    overflow-y: scroll;
    height: 100vh;
    box-sizing: border-box;
  }

  .active {
    color: red;
  }
}
</style>
