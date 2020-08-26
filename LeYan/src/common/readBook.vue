<template>
  <div>
    <div
      class="book"
      ref="wrapper"
      :style="{color:fontColor,background:background}"
      @click="setReadShow"
    >
      <div
        class="books-con"
        v-infinite-scroll="loadMore"
        infinite-scroll-disabled="loading"
        infinite-scroll-distance="0"
        infinite-scroll-immediate-check="false"
      >
        <div class="book-content" ref="content">
          <h1 class="book-title" :style="{fontSize:fontSize*1.2+'px'}">{{bookContent.title}}</h1>
          <div
            class="book-inner"
            v-html="bookChaptersBody(bookContent.content)"
            :style="{fontSize:fontSize+'px'}"
          ></div>
        </div>
        <div class="loadMore" style="text-align: center" v-show="moreLoading">
          <mt-spinner type="triple-bounce" color="#cdcdcd"></mt-spinner>
        </div>
      </div>

      <div class="page-read-option" :class="{'show-panel':option}">
        <div class="top-controll-bar">
          <mt-header :title="book.title" class="book-header">
            <div @click="$router.back(-1)" slot="left">
              <mt-button icon="back">返回</mt-button>
            </div>
          </mt-header>
        </div>
        <div class="addReader" @click="addBookSelf">
          <p>{{flag ? '撤出书架' : '加入书架'}}</p>
        </div>
        <div class="bottom-controll-bar">
          <div class="readSet">
            <div class="readSet-item">
              <span @click.stop="fontSet('reduce',$event)">Aa-</span>
              <span @click.stop="fontSet('add',$event)">Aa+</span>
            </div>
            <div class="readSet-item pattern">
              <span
                v-for="(item,index) in pattern"
                :key="index"
                :class="{active:readePattern===index}"
                @click.stop="setPattern(item,index)"
              >{{item.item}}</span>
            </div>
          </div>
          <mt-button type="default" @click="prevChapter" style="box-shadow:none">上一章</mt-button>
          <mt-button type="primary" @click="setList" style="box-shadow:none">目录</mt-button>
          <mt-button type="default" @click="nextChapter" style="box-shadow:none">下一章</mt-button>
        </div>
      </div>
    </div>
    <div class="chapter-list" v-show="listOption" @click.stop="setList">
      <div class="list-content">
        <div class="top-bar">
          <p>{{bookInfo.title}}</p>
        </div>
        <div class="chapter-con">
          <div ref="chapterList" class="chapterList">
            <div
              v-for="(list,index) in chapterList"
              @click="selectChapter(index)"
              :class="{'current':bookCurrentPage===index}"
              :key="index"
            >{{list}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import { mapGetters } from "vuex";
import { Indicator, Toast } from "mint-ui";
import Book from "../assets/js/bookSource";
import { book, bookSources, BookChapters, chapterContent } from "../api/api";
export default {
  data() {
    return {
      margin: 10,
      fontSize: 18,
      fontColor: "#5c5d58",
      background: "#070707",
      bookContent: {
        title: "",
        content: "",
      },
      nextContent: {
        title: "",
        content: "",
      },
      prevContent: {
        title: "",
        content: "",
      },
      BookSourcesId: 0,
      bookCurrentPage: 0,
      bookSourceLinks: [],
      chapterList: [],
      SourceList: [],
      bookInfo: {},
      loading: false,
      option: false,
      moreLoading: false,
      flag: false,
      pattern: [
        {
          item: "默认",
          color: "#5c5d58",
          background: "#eee6dd",
        },
        {
          item: "夜间",
          color: "#666",
          background: "#000",
        },
        {
          item: "护眼",
          color: "#5c5d58",
          background: "#c8e8c8",
        },
      ],
      option: false,
      listOption: false,
      readePattern: 0,
    };
  },
  computed: {
    ...mapGetters(["book"]),
  },
  beforeCreate() {
    Indicator.open("加载中");
  },
  created() {
    this.BookSourcesId = this._bookSourceId();
  },
  beforeRouteEnter(to, from, next) {
    let localShelf = JSON.parse(window.localStorage.getItem("book"))
      ? JSON.parse(window.localStorage.getItem("book"))
      : {};
    next((vm) => {
      vm.getBookSources(vm.$route.params.id);
      vm.getBook(vm.$route.params.id);
    });
  },

  mounted() {
    this.getUserLocalStorage();
    const that = this;
    window.onresize = () => {
      return (() => {
        that.clWidth = document.body.clientWidth;
        that.$router.go(0);
      })();
    };
  },
  watch: {
    bookContent(newVal, oldVla) {
      this.$refs.wrapper.scrollTop = 0;
    },
  },
  methods: {
    //获取用户设置
    getUserLocalStorage() {
      let localShelf = JSON.parse(window.localStorage.getItem("userSet"))
        ? JSON.parse(window.localStorage.getItem("userSet"))
        : {};
      this.fontSize = localShelf.fontSize;
      this.background = localShelf.background;
      this.fontColor = localShelf.color;
      this.readePattern = localShelf.readePattern;
      this.pagingPattern = localShelf.pagingPattern;
    },
    //将用户设置进行缓存
    setUserLocalStorage() {
      let localShelf = JSON.parse(window.localStorage.getItem("userSet"))
        ? JSON.parse(window.localStorage.getItem("userSet"))
        : {};
      localShelf = {
        fontSize: this.fontSize,
        background: this.background,
        color: this.fontColor,
        readePattern: this.readePattern,
        pagingPattern: this.pagingPattern,
      };
      window.localStorage.setItem("userSet", JSON.stringify(localShelf));
    },

    //获取和设置LocalStorage
    getBookLocalStorage() {
      let localShelf = JSON.parse(window.localStorage.getItem("book"))
        ? JSON.parse(window.localStorage.getItem("book"))
        : {};
      if (localShelf[this.$route.params.id]) {
        this.flag = true;
      }
      return localShelf;
    },
    //书源index
    _bookSourceId() {
      return this.getBookLocalStorage()[this.$route.params.id]
        ? this.getBookLocalStorage()[this.$route.params.id].bookSource
        : 0;
    },
    //获取阅读章节
    _chapterIndexCache() {
      return this.getBookLocalStorage()[this.$route.params.id]
        ? this.getBookLocalStorage()[this.$route.params.id].chapterIndexCache
        : 0;
    },
    //获取阅读章节页面
    _pageIndexCache() {
      return this.getBookLocalStorage()[this.$route.params.id]
        ? this.getBookLocalStorage()[this.$route.params.id].pageIndexCache
        : 1;
    },
    //书籍信息
    getBook(id) {
      book(id).then(
        (res) => {
          this.bookInfo = res.data;
         
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
    //将书源和章节及页面缓存到LocalStorage
    setBookLocalStorage() {
      let localShelf = JSON.parse(window.localStorage.getItem("book"))
        ? JSON.parse(window.localStorage.getItem("book"))
        : {};
      localShelf[this.$route.params.id].chapterIndexCache = this.bookCurrentPage;
      localShelf[this.$route.params.id].bookSource = this.BookSourcesId;
      localShelf[this.$route.params.id].pageIndexCache = this.currentPaging;
      window.localStorage.setItem("book", JSON.stringify(localShelf));
    },
    //获取书籍源
    getBookSources(id) {
      bookSources(id).then(
        (res) => {
          this.SourceList = res.data;
          this.getBookChapters(this.SourceList[this._bookSourceId()]._id);
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
    //根据书籍源获取章节
    getBookChapters(id) {
      let arr = [];
      BookChapters(id).then(
        (res) => {
          for (let i = 0; i < res.data.chapters.length; i++) {
            arr.push(res.data.chapters[i].title);
            this.bookSourceLinks.push(
              encodeURIComponent(res.data.chapters[i].link)
            );
          }
          this.chapterList = arr;
          this.getChapters(this.bookSourceLinks[this._chapterIndexCache()]);
        
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
    //根据章节link获取详细内容
    getChapters(link) {
      chapterContent(link).then((res) => {
        if (res.data.ok) {
          Indicator.close();
          if (res.data.chapter.cpContent) {
            this.bookContent = this._nromalBook(
              res.data.chapter.title,
              res.data.chapter.cpContent
            );
          }
        }
      
      });
    },
    //字符串解析
    bookChaptersBody(books) {
      if (books) {
        let c = /[\u4E00-\u9FA5\uF900-\uFA2D]/g;
        let _book = JSON.stringify(books).replace(/^"|"$/g, "");
        this.loading = false;
        if (c.test(_book)) {
          _book =
            "<p>" +
            _book.replace(/\s*/g, "").replace(/\\n/g, "</p><p>") +
            "</p>";
          return _book;
        }
      }
    },
    //构建book类
    _nromalBook(title, content) {
      let book = new Book({
        title: title,
        content: content,
      });
      return book;
    },
    //无限加载
    loadMore() {
      this.loading = true;
      if (this.bookCurrentPage === this.bookSourceLinks.length) {
        return;
      }
      this.moreLoading = true;
      this.bookCurrentPage++;
      setTimeout(() => {
        this.getChapters(this.bookSourceLinks[this.bookCurrentPage]);
        if (this.getBookLocalStorage()[this.$route.params.id]) {
          this.setBookLocalStorage();
        }
        this.loading = false;
        this.moreLoading = false;
      }, 1000);
    },



    setReadShow() {
      this.option = !this.option;
    },
    //字体设置
    fontSet(str) {
      this.option = true;
      if (str === "reduce") {
        if (this.fontSize === 14) {
          return;
        } else {
          this.fontSize -= 0.8;
          this.setUserLocalStorage();
        }
      }
      if (str === "add") {
        if (this.fontSize === 22) {
          return;
        } else {
          this.fontSize += 0.8;
          this.setUserLocalStorage();
        }
      }
    },
    //阅读模式设置
    setPattern(item, index) {
      this.option = true;
      this.readePattern = index;
      this.fontColor = item.color;
      this.background = item.background;
      this.setUserLocalStorage();
    },
    //获取上一章
    getPrevChapter(click) {
      chapterContent(this.bookSourceLinks[this.bookCurrentPage - 1]).then(
        (res) => {
          if (res.data.ok) {
            Indicator.close();
            if (res.data.chapter.cpContent) {
              this.prevContent = this._nromalBook(
                res.data.chapter.title,
                res.data.chapter.cpContent
              );
              if (click) {
                this.bookContent = this.prevContent;
              }
            } 
          }
        }
      );
    },
    //获取下一章
    getNextChapter(click) {
      chapterContent(this.bookSourceLinks[this.bookCurrentPage + 1]).then(
        (res) => {
          if (res.data.ok) {
            Indicator.close();
            if (res.data.chapter.cpContent) {
              this.nextContent = this._nromalBook(
                res.data.chapter.title,
                res.data.chapter.cpContent
              );
              if (click) {
                this.bookContent = this.nextContent;
              }
            }
          }
        }
      );
    },
    //上下章节切换
    nextChapter() {
      if (this.bookCurrentPage === this.bookSourceLinks.length) {
        Toast("已经是最后一章了！");
        return;
      }
      this.moreLoading = false;
      this.loading = true;
      Indicator.open("加载中...");
      this.bookSource = [];
      this.getNextChapter("click");
      this.currentPaging = 1;
      this.offsetX = 0;
      this.styleObject = "";
      this.bookCurrentPage++;
      if (this.getBookLocalStorage()[this.$route.params.id]) {
        this.setBookLocalStorage();
      }
    },
    prevChapter() {
      if (this.bookCurrentPage === 0) {
        Toast("已经是第一章了！");
        return;
      }
      this.moreLoading = false;
      this.loading = true;
      Indicator.open("加载中...");
      this.bookSource = [];
      this.getPrevChapter("click");
      this.currentPaging = 1;
      this.offsetX = 0;
      this.styleObject = "";
      this.bookCurrentPage--;
      if (this.getBookLocalStorage()[this.$route.params.id]) {
        this.setBookLocalStorage();
      }
    },

    //加入书架
    addBookSelf() {
      let localShelf = JSON.parse(window.localStorage.getItem("book"))
        ? JSON.parse(window.localStorage.getItem("book"))
        : {};
      if (this.flag) {
        delete localShelf[this.$route.params.id];
        window.localStorage.setItem("book", JSON.stringify(localShelf));
        this.flag = !this.flag;
        Toast({
          message: "操作成功",
          duration: 500,
        });
      } else {
        localShelf[this.$route.params.id] = {
          cover: this.bookInfo.cover,
          title: this.bookInfo.title,
          id: this.bookInfo._id,
          chapterIndexCache: this.bookCurrentPage,
          bookSource: this.BookSourcesId,
          pageIndexCache: this.currentPaging,
        };
        window.localStorage.setItem("book", JSON.stringify(localShelf));
        this.flag = !this.flag;

        Toast({
          message: "操作成功",
          duration: 500,
        });
      }
    },
    setList() {
      this.listOption = !this.listOption;
      if (!this.option) {
        return;
      }
      this.option = !this.option;
    },
    //切换目录
    selectChapter(index) {
      this.isClickPage = false;
      this.moreLoading = false;
      this.loading = true;
      Indicator.open("加载中...");
      this.bookSource = [];
      this.bookCurrentPage = index;
      this.currentPaging = 1;
      this.offsetX = 0;
      this.styleObject = {
        transform: "translateX(" + this.offsetX + "px" + ")",
        transitionDuration: "0s",
      };
      this.getChapters(this.bookSourceLinks[index]);
      if (this.getBookLocalStorage()[this.$route.params.id]) {
        this.setBookLocalStorage();
      }
    },
  },
};
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
.book {
  background: #eee6dd;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  margin-top: -1px;
  position: relative;

  .bootPage {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: rgba(50, 51, 52, 0.9);
    z-index: 10000;
    display: flex;
    max-width: 750px;

    .b-item {
      width: 33.3333333%;

      .center {
        padding: 20px;
        line-height: 100vh;
        width: 100%;
        font-size: 25px;
        color: #d0d0d0;
        box-sizing: border-box;
      }
    }

    .bootPage-center {
      border-left: 1px solid #5c5c5c;
      border-right: 1px solid #5c5c5c;
    }
  }

  .books-con {
    width: 100%;

    .book-content {
      padding: 50px 10px 80px 10px; /* no */

      .book-inner {
        text-align: justify;
        line-height: 60px; /* no */
        text-indent: 2em;
      }

      .book-title {
        line-height: 50px;
        font-weight: 400;
        margin-bottom: 25px;
      }
    }
  }

  .loadMore {
    height: 80px;
    line-height: 80px;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
  }

  .read-content {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .read-article {
      position: absolute;
      overflow: hidden;
      padding: 0 10px; /* no */
      text-align: justify;
      bottom: 20px; /* no */
      top: 50px; /* no */

      .read-section {
        height: 100%;

        .read-section-inner {
          overflow: visible;
          height: 100%;

          .book-inner {
            line-height: 60px; /* no */
            text-indent: 2em;
          }
        }

        .book-title {
          line-height: 50px;
          font-weight: 400;
          margin-bottom: 25px;
        }
      }
    }

    .article-page {
      color: #585858;
      font-size: 13px;
      position: absolute;
      left: 10px;
      bottom: 10px;
    }
  }
}

.page-read-option {
  position: fixed;
  z-index: 888;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  visibility: hidden;

  .book-header {
    line-height: 80px;
    height: 80px;
    background-color: rgba(50, 51, 52, 0.9);
  }

  .bottom-controll-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 0;

    .mint-button {
      width: 33.3%;
      line-height: 80px;
      height: 80px;
      color: #fff;
      background: rgba(50, 51, 52, 0.9);
      border: 1px solid #535353;
      font-size: 28px;
    }

    .add_my {
      position: absolute;
      bottom: 200px;
      right: 0;
      width: 150px;
      height: 60px;
      line-height: 60px;
      border-radius: 50px 0 0 50px;
    }

    .readSet {
      width: 100%;
      color: #fff;
      font-size: 28px;
      background: rgba(50, 51, 52, 0.9);
      padding: 20px;
      box-sizing: border-box;

      .readSet-item {
        height: 80px;

        span {
          text-align: center;
          display: inline-block;
          line-height: 60px;
          width: 200px;
          border-radius: 5px;
          border: 1px solid #535353;

          &.active {
            border: 1px solid #cdcdcd;
          }
        }
      }

      .pattern {
        span:nth-of-type(2) {
          margin: 0 10px;
        }
      }
    }
  }

  .addReader {
    width: 25%;
    position: absolute;
    line-height: 60px;
    height: 60px;
    background: rgba(50, 51, 52, 0.9);
    color: #fff;
    text-align: center;
    border-radius: 10px;
    right: 0;
    top: 100px;
  }
}

.show-panel {
  visibility: visible;
}

.chapter-list {
  position: fixed;
  z-index: 999;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: transparent;

  .list-content {
    width: 45%;
    height: 100%;
    background: #fff;
    position: absolute;

    .top-bar {
      position: absolute;
      width: 100%;
      height: 120px;
      line-height: 120px;
      font-size: 25px;
      font-weight: 600;
      padding-left: 20px;
      border-bottom: 1px solid #ebebeb;
      box-sizing: border-box;
      z-index: 100;
      background: #fff;
    }

    .chapter-con {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100vh;
      margin-top: 120px;
      padding-left: 20px;
      box-sizing: border-box;
      overflow-y: scroll;

      .chapterList {
        width: 100%;

        div {
          line-height: 80px;
          height: 80px;
          font-size: 23px;
          color: #999;
          border-bottom: 1px solid #ebebeb;

          &.current {
            color: #070707;
          }
        }
      }
    }
  }
}

.right {
  width: 100%;
  height: 80px;
  text-align: right;
}

.changeSource {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-color: rgba(50, 51, 52, 0.8);

  .source-content {
    width: 500px;
    height: 800px;
    background: #fff;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -250px;
    margin-top: -400px;
    border-radius: 15px;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: scroll;

    .source-item {
      line-height: 50px;
      font-size: 25px;
      position: relative;

      .center {
        width: 80%;
        font-size: 20px;
        color: #999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .select {
        position: absolute;
        right: 0;
        top: 20px;
        background: #c9c9c9;
        padding: 0 10px;
        border-radius: 15px;
        display: none;
        color: #fff;
        font-size: 18px;
      }

      .active {
        display: block;
      }
    }
  }
}

.change_source_btn {
  width: 200px;
  height: 80px;
  text-align: center;
  line-height: 80px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -80px;
  margin-left: -100px;
  z-index: 1000;

  .source_btn {
    width: 100%;
    height: 100%;
    font-size: 25px;
  }
}
</style>
