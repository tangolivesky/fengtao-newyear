<template>
  <div id="app">
    <div class="bg" id="bg"></div>
    <div class="content">
      <div class="danmu">
        <vue-baberrage
          :isShow="barrageIsShow"
          :barrageList="barrageList"
          :maxWordCount="40"
          :loop="barrageLoop"
        >
          <template v-slot:default="slotProps">
            <div class="content">
              {{ slotProps.item.msg }}
            </div>
          </template>
        </vue-baberrage>
      </div>
      <div class="logo-wrap">
        <div v-show="pageShow">
          <img class="logo" src="./assets/3flogo.png" />
          <canvas
            class="canvas"
            width="750"
            height="720"
            id="starCanvas"
          ></canvas>
        </div>
      </div>
      <div class="flag">
        <img class="img" src="./assets/huhu.png" />
      </div>
      <div class="btn-wrap">
        <div class="btn" v-on:click="btnFlashClick">
          <div class="txt">我的FLAG</div>
        </div>
      </div>
    </div>

    <div class="modal" v-show="modalShow">
      <div class="dialog">
        <div class="title">部门</div>
        <div class="wrap">
          <select
            :disabled="!btnFlashShow"
            v-model="form.Company"
            @change="departChange($event)"
            class="select"
          >
            <option
              v-bind:key="index"
              v-for="(item, index) in departOptions"
              :value="item.value"
            >
              {{ item.name }}
            </option>
          </select>
        </div>
        <div class="title">姓名</div>
        <div class="wrap">
          <input
            :disabled="!btnFlashShow"
            placeholder="请填写您的姓名"
            v-model="form.Name"
            type="text"
            class="name"
          />
        </div>
        <div class="title">目标</div>
        <div class="wrap">
          <textarea
            :disabled="!btnFlashShow"
            placeholder="请填写10-20字（含标点符号）"
            v-model="form.FlagContent"
            class="mubiao"
          ></textarea>
        </div>
        <div class="btn-wrap" v-if="btnFlashShow">
          <div class="btn" v-on:click="save">
            <div class="txt">提交</div>
          </div>
        </div>
        <div class="btn-wrap" v-if="!btnFlashShow">
          <div class="btn" v-on:click="modalClose">
            <div class="txt">关闭</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MESSAGE_TYPE } from "vue-baberrage";
import ajax from "./ajax";
import stars from "./star";
import greenStarImg from "./assets/greenstar.png";
import yellowStarImg from "./assets/yellowstar.png";
import bgImg from "./assets/bg.jpg";
import departs from "./depart.json";

export default {
  name: "App",
  data() {
    return {
      pageShow: true,
      barrageIsShow: true,
      barrageList: [],
      barrageLoop: true,
      modalShow: false,
      canvasObj: null,
      canvasCtx: null,
      greenStarImg: greenStarImg,
      form: {
        Company: "",
        Name: "",
        FlagContent: "",
      },
      departOptions: [],
      tempId: 0,
      localStars: stars,
      interId: 0,
      btnFlashShow: false,
    };
  },
  components: {},
  mounted() {
    this.initBg();
    this.initStatus();
    this.initDeparts();
    this.initCanvas();
    this.initDatas();
  },
  methods: {
    //查看个人的提交状态
    initStatus() {
      const personxh = localStorage.getItem("personxh");
      if (personxh) {
        const form = new FormData();
        form.set("Xh", personxh);
        ajax
          .post("/GetStatusByXh", form)
          .then((res) => {
            const data = res.data;
            if (data.Code === 1) {
              if (data.Status === 0) {
                this.btnFlashShow = true;
                localStorage.setItem("Company", "");
                localStorage.setItem("Name", "");
                localStorage.setItem("FlagContent", "");
              }
            }
          })
          .catch((err) => {
            console.log("err", err);
          });
      } else {
        this.btnFlashShow = true;
      }
    },
    initCanvas() {
      const c = document.getElementById("starCanvas");
      const ctx = c.getContext("2d");
      this.canvasObj = c;
      this.canvasCtx = ctx;
    },
    initDeparts() {
      if (Array.isArray(departs)) {
        departs.forEach((item) => {
          this.departOptions.push({
            name: item,
            value: item,
          });
        });
      }
    },
    //背景加载完毕
    initBg() {
      const image1 = new Image();
      image1.src = bgImg;
      image1.onload = () => {
        this.pageShow = true;
        this.barrageIsShow = true;
      };
    },
    departChange(event) {
      this.form.Company = event.target.value;
    },
    addToList(id, msg) {
      let extraWidth = 0;
      if (msg.length < 5) {
        extraWidth = 30;
      }
      if (msg.length >= 5 && msg.length < 10) {
        extraWidth = 90;
      }
      if (msg.length >= 10 && msg.length < 15) {
        extraWidth = 90;
      }
      if (msg.length >= 15 && msg.length <= 21) {
        extraWidth = 130;
      }
      this.barrageList.push({
        id: id,
        msg: msg,
        time: 5,
        type: MESSAGE_TYPE.NORMAL,
        extraWidth: extraWidth,
      });
    },
    initDatas() {
      ajax
        .get("/GetChat")
        .then((res) => {
          const data = res.data;

          let tempSet = new Map();
          data.datas.forEach((item) => {
            tempSet.set(item.Xh, item.FlagContent);
            this.addToList(item.Xh, item.FlagContent);
          });

          this.localStars = this.localStars.map((star) => {
            if (tempSet.has(star.id.toString())) {
              star.status = true;
            }
            return star;
          });

          this.drawStars();
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    modalClose() {
      this.modalShow = false;
    },
    //画星星，需要调用接口获取已经点亮的星星
    drawStars() {
      const personxh = localStorage.getItem("personxh");

      this.canvasCtx.clearRect(0, 0, 750, 720); // clear canvas
      this.localStars.forEach((item) => {
        const img = new Image();
        if (item.status === true) {
          //如果是自己的星星,展示黄色
          if (personxh === item.id.toString()) {
            img.src = yellowStarImg;
            img.onload = () => {
              this.canvasCtx.drawImage(
                img,
                item.x,
                item.y,
                item.width,
                item.height
              );
            };
          } else {
            img.src = greenStarImg;
            img.onload = () => {
              this.canvasCtx.drawImage(
                img,
                item.x,
                item.y,
                item.width,
                item.height
              );
            };
          }
        } 
        // else {
        //   img.src = greenStarImg;
        //   img.onload = () => {
        //     this.canvasCtx.drawImage(
        //       img,
        //       item.x,
        //       item.y,
        //       item.width,
        //       item.height
        //     );
        //   };
        // }
      });
    },
    //画星星，画自己的那颗星星
    reDrawStars(id) {
      this.localStars = this.localStars.map((item) => {
        if (item.id === id) {
          item.status = true;
        }
        return item;
      });
      this.drawStars();
    },
    btnFlashClick() {
      this.modalShow = true;
      this.form.Company =
        localStorage.getItem("Company") != null
          ? localStorage.getItem("Company")
          : "";
      this.form.Name =
        localStorage.getItem("Name") != null
          ? localStorage.getItem("Name")
          : "";
      this.form.FlagContent =
        localStorage.getItem("FlagContent") != null
          ? localStorage.getItem("FlagContent")
          : "";
    },
    save() {
      console.log("this.form", this.form);
      if (this.form.Company.trim() === "") {
        alert("请填写您的部门");
        return;
      }
      if (this.form.Name.trim() === "") {
        alert("请填写您的姓名");
        return;
      }
      if (this.form.FlagContent.trim() === "") {
        alert("请填写您的目标");
        return;
      }
      // if (
      //   this.form.FlagContent.length > 20 ||
      //   this.form.FlagContent.length < 10
      // ) {
      //   alert("请填写10到20字的内容");
      //   return;
      // }
      const postForm = new FormData();
      postForm.append("Company", this.form.Company);
      postForm.append("Name", this.form.Name);
      postForm.append("FlagContent", this.form.FlagContent);
      ajax
        .post("/UpdateFlag", postForm)
        .then((res) => {
          const data = res.data;

          if (data.Code === 1) {
            const tempId = data.Xh;
            this.btnFlashShow = false;
            localStorage.setItem("personxh", tempId);
            localStorage.setItem("Company", this.form.Company);
            localStorage.setItem("Name", this.form.Name);
            localStorage.setItem("FlagContent", this.form.FlagContent);
            this.addToList(tempId, this.form.FlagContent);
            this.reDrawStars(tempId);
            this.modalShow = false;
          } else {
            alert(data.Msg);
          }
        })
        .catch((err) => {
          console.log("err", err);
        })
        .finally(() => {
          //this.modalShow = false;
        });
    },
  },
};
</script>

<style lang="less">
select,
input,
textarea {
  outline: none;
}
body {
  margin: 0px;
  padding: 0px;
}
#app {
  .bg {
    background: url("./assets/bg.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
  }
  .content {
    .danmu {
      height: 200px;
      position: relative;
      .content {
        height: 60px;
        text-align: center;
        // background: #ffffff;
        border-radius: 30px;
        font-size: 30px;
        font-family: PingFang SC;
        font-weight: 400;
        line-height: 60px;
        padding: 0px 15px;
        color: #ffffff;
      }
    }
    .logo-wrap {
      position: relative;
      width: 750px;
      height: 720px;
      .logo {
        width: 750px;
        height: 720px;
      }
      .canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 750px;
        height: 720px;
        z-index: 99;
      }
    }
    .flag {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      .img {
        width: 546px;
        height: 236px;
      }
    }
    .btn-wrap {
      position: relative;
      margin-top: 60px;
      display: flex;
      justify-content: center;
      align-items: center;

      .btn {
        width: 480px;
        height: 100px;
        background: #ffffff;
        opacity: 1;
        border-radius: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
        .txt {
          font-size: 40px;
          font-family: PingFang SC;
          font-weight: bold;
          line-height: 56px;
          color: #0f1628;
        }
      }
    }
  }

  .modal {
    z-index: 999;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    justify-content: center;
    opacity: 1;
    .dialog {
      margin-top: 208px;
      width: 640px;
      height: 902px;
      background: #ffffff;
      opacity: 1;
      border-radius: 24px;
      .wrap {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .title {
        padding-left: 60px;
        margin-top: 40px;
        font-size: 30px;
        font-family: PingFang SC;
        font-weight: 400;
        line-height: 42px;
        color: #0f1628;
      }
      .select {
        width: 580px;
        height: 70px;
        background: #f4f4f4;
        border: 1px solid #707070;
      }
      .name {
        width: 540px;
        height: 70px;
        background: #f4f4f4;
        border: 1px solid #707070;
      }
      .mubiao {
        width: 540px;
        height: 232px;
        background: #f4f4f4;
        border: 1px solid #707070;
      }
      .btn-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        .btn {
          margin-top: 50px;
          width: 560px;
          height: 90px;
          background: #0f1628;
          opacity: 1;
          border-radius: 200px;
          display: flex;
          justify-content: center;
          align-items: center;
          .txt {
            font-size: 36px;
            font-family: PingFang SC;
            font-weight: bold;
            line-height: 50px;
            color: #ffffff;
          }
        }
      }
    }
  }
}
</style>
