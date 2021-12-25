<template>
  <div id="app">
    <div class="bg" id="bg">
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
        <div class="btn" v-on:click="btnShow">
          <div class="txt">我的FLAG</div>
        </div>
      </div>
    </div>
    <div class="modal" v-show="modalShow">
      <div class="dialog">
        <div class="title">部门</div>
        <div class="wrap">
          <select v-model="form.department" class="select">
            <option value="1">测试</option>
          </select>
        </div>
        <div class="title">姓名</div>
        <div class="wrap">
          <input
            placeholder="请填写您的姓名"
            v-model="form.name"
            type="text"
            class="name"
          />
        </div>
        <div class="title">目标</div>
        <div class="wrap">
          <textarea
            placeholder="请填写20个字以内"
            v-model="form.target"
            class="mubiao"
          ></textarea>
        </div>
        <div class="btn-wrap">
          <div class="btn" v-on:click="save">
            <div class="txt">提交</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MESSAGE_TYPE } from "vue-baberrage";
import stars from "./star";
import greenStarImg from "./assets/greenstar.png";
import yellowStarImg from "./assets/yellowstar.png";
import bgImg from "./assets/bg.jpg";

export default {
  name: "App",
  data() {
    return {
      pageShow: false,
      barrageIsShow: true,
      barrageList: [],
      barrageLoop: true,
      modalShow: false,
      canvasObj: null,
      canvasCtx: null,
      greenStarImg: greenStarImg,
      form: {
        department: "",
        name: "",
        target: "",
      },
      tempId: 0,
      localStars: stars,
      interId: 0,
    };
  },
  components: {},
  mounted() {
    this.init();
    this.initStars();
  },
  methods: {
    init() {
      this.initBg();
      const c = document.getElementById("starCanvas");
      const ctx = c.getContext("2d");
      this.canvasObj = c;
      this.canvasCtx = ctx;
    },
    //背景加载完毕
    initBg() {
      const image1 = new Image();
      image1.src = bgImg;
      image1.onload = () => {
        const bg = document.getElementById("bg");
        bg.style.backgroundImage = "url('" + bgImg + "')";
        this.pageShow = true;
        this.barrageIsShow = true;
      };
    },
    addToList(id, msg) {
      this.barrageList.push({
        id: id,
        msg: msg,
        time: 5,
        type: MESSAGE_TYPE.NORMAL,
      });
    },
    //初始化星星，需要调用接口获取已经点亮的星星
    initStars() {
      this.canvasCtx.clearRect(0, 0, 750, 720); // clear canvas
      this.localStars.forEach((item) => {
        const img = new Image();
        if (item.status === true) {
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
      });
    },
    //画星星，画自己的那颗星星
    drawStars(id) {
      this.localStars = this.localStars.map((item) => {
        if (item.id === id) {
          item.status = true;
        }
        return item;
      });
      this.initStars();
    },
    btnShow() {
      this.modalShow = true;
    },
    save() {
      if (this.form.name.trim() === "") {
        alert("请填写您的姓名");
        return;
      }
      if (this.form.target.trim() === "") {
        alert("请填写您的目标");
        return;
      }
      if (this.form.target.length > 20) {
        alert("请填写20个字以内");
        return;
      }
      this.tempId = this.tempId + 1;
      this.addToList(this.tempId, this.form.target);
      this.drawStars(this.tempId);
      this.modalShow = false;
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
  margin: 0px;
  padding: 0px;
  .bg {
    background: url("./assets/bg.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    height: 1666px;
    .danmu {
      height: 308px;
      .content {
        height: 60px;
        text-align: center;
        background: #ffffff;
        border-radius: 30px;
        font-size: 30px;
        font-family: PingFang SC;
        font-weight: 400;
        line-height: 60px;
        padding: 0px 15px;
        color: #0f1628;
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
      display: flex;
      justify-content: center;
      align-items: center;
      .img {
        width: 546px;
        height: 236px;
      }
    }
    .btn-wrap {
      margin-top: 130px;
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
