<template>
  <div>
    <m-header></m-header>
    <div class="rank-wrapper">
      <div class="rank-section" v-show="maleRank.length">
        <h4>男生</h4>
        <div class="rank-item" v-for="(item,index) in maleRank" :key="index" @click="goRankDetail(item)">
          <img :src="url+item.cover" alt />
          <span>{{item.title}}</span>
        </div>
      </div>
      <div class="rank-section" v-show="femaleRank.length">
        <h4>女生</h4>
        <div class="rank-item" v-for="(item,index) in femaleRank"  :key="index" @click="goRankDetail(item)">
          <img :src="url+item.cover" alt />
          <span>{{item.title}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import { mapMutations } from "vuex";
import { rankCategory } from "../../api/api";
import { Indicator } from "mint-ui";
export default {
  data() {
    return {
      url: "http://statics.zhuishushenqi.com/",
      femaleRank: [],
      maleRank: [],
    };
  },
  created() {
    this.getRanking();
  },
  methods: {
    //获取排行榜类型数据
    getRanking() {
      Indicator.open("加载中...");
      rankCategory().then(
        (res) => {
          if(res.data.ok){
            this.femaleRank = res.data.female.slice(0, 6);
            this.maleRank = res.data.male.slice(0, 6);
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

    //跳转到对应类型的表单中
    goRankDetail(item) {
      this.$router.push({
        path: `/rank/${item._id}`,
        query: { title: item.title },
      });
      //调用‘SET_RANK’方法
      this.setRank(item);
    },

    //引入mutations中方法
    ...mapMutations({
      setRank: "SET_RANK",
    }),
  },
};
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
.rank-wrapper {
  .rank-section {
    h4 {
      line-height: 100px;
      padding: 0 20px;
      color: #070707;
      font-weight: normal;
    }

    .rank-item {
      display: flex;
      height: 100px;
      align-items: center;
      padding-left: 20px;

      img {
        width: 70px;
        height: 70px;
      }

      span {
        flex: 1;
        margin-left: 20px;
        line-height: 50px;
        font-size: 25px;
        border-bottom: 1px solid #f5f5f5;
        padding: 20px 0;
        box-sizing: content-box;
      }
    }
  }
}
</style>
