<template>
  <div>
    <m-header></m-header>
    <div class="category-wrapper">

      <div class="category-section" v-show="category.male.length">
        <h4>{{categoryType.male.name}}</h4>
        <div class="category-list">
          <div
            class="category-item"
            @click="goCategoryDetail(item,categoryType.male.type)"
            v-for="(item ,key) in category.male"
            :key="key"
          >
            <p class="name">{{item.name}}</p>
            <p class="count">{{item.bookCount}}</p>
          </div>
        </div>
      </div>

      <div class="category-section" v-show="category.female.length">
        <h4>{{categoryType.female.name}}</h4>
        <div class="category-list">
          <div
            class="category-item"
            @click="goCategoryDetail(item,categoryType.female.type)"
            v-for="(item,key) in category.female"
            :key="key"
          >
            <p class="name">{{item.name}}</p>
            <p class="count">{{item.bookCount}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import { Indicator } from "mint-ui";
import { categories } from "../../api/api";
export default {
  data() {
    return {
      category: {
        male: [],
        female: [],
      },
      categoryType: {
        male: {
          name: "男生",
          type: "male",
        },
        female: {
          name: "女生",
          type: "female",
        },
      },
    };
  },
  created() {
    this.getCategory();
  },
  methods: {
    //获取分类男女书籍类型的数据
    getCategory() {
      Indicator.open("加载中...");
      categories().then(
        (res) => {
          if(res.data.ok) {
           this.category.male  = res.data.male;
           this.category.female = res.data.female;
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
    //点击跳转到对应类型的表单
    goCategoryDetail(item, key) {
      this.$router.push({
        path: "/categories/detail",
        query: { gender: key, major: item.name },
      });
    },
  },
};
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
.category-wrapper {
  .category-section {
    h4 {
      line-height: 100px;
      padding: 0 20px;
      color: #070707;
      font-weight: normal;
    }

    .category-list {
      display: flex;
      width: 100%;
      flex-wrap: wrap;

      .category-item {
        flex: 1;
        width: 33.3333333%;
        max-width: 33.3333333%;
        min-width: 33.3333333%;
        text-align: center;
        padding: 20px;
        line-height: 30px;
        box-sizing: border-box;

        &:nth-child(3n+3) {
          border-right: none;
        }

        &:nth-child(n+4) {
          margin-top: -1px; /* no */
        }

        .name {
          font-size: 25px;
          font-weight: 700;
          color: #333;
        }

        .count {
          font-size: 12px;
          color: #ccc;
        }
      }
    }
  }
}
</style>
