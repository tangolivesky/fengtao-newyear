<template>
  <div id="lanternRddle">
    <div class="bg" id="bg"></div>
    <div class="content">
      <!-- <div class="danmu">
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
      </div> -->
      <div class="logo-wrap">
        <div v-show="pageShow">
          <img class="logo" src="@/assets/lanternRddle/3flogo.png" />
          <canvas
            class="canvas"
            width="750"
            height="720"
            id="starCanvas"
          ></canvas>
        </div>
      </div>
      <div class="flag">
        <img class="img" src="@/assets/lanternRddle/huhu.png" />
      </div>
      <div class="btn-wrap">
        <div class="btn" v-on:click="btnFlashClick" v-if="canJoinActive">
          <div class="txt">点击猜灯谜</div>
        </div>
      </div>
    </div>

    <div class="modal" v-show="modalShow" @click="modalShow = false">
      <div class="blur_bj"></div>
      <div class="dialog" @click="stopPropagation($event)">
        <div class="title">部门</div>
        <div class="wrap">
          <select
            :disabled="localUserInfo && localUserInfo.count > 0"
            placeholder="请选择您的部门"
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
            :disabled="localUserInfo && localUserInfo.count > 0"
            placeholder="请填写您的姓名"
            v-model="form.Name"
            type="text"
            class="name"
          />
        </div>
        <div class="btn-wrap">
          <div class="btn" v-on:click="save" v-if="canJoinActive">
            <div class="txt">开始猜灯谜</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MESSAGE_TYPE } from "vue-baberrage";
import ajax from "@/core/ajax";
import stars from "@/core/star";
// import greenStarImg from "@/assets/greenstar.png";
import activatedLantern from "@/assets/lanternRddle/activated-lantern.png";
import highlightActivatedLantern from "@/assets/lanternRddle/highlight-activited-lantern.png";
import bgImg from "@/assets/lanternRddle/bg.png";
import departs from "@/depart.json";

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
      // greenStarImg: greenStarImg,
      form: {
        Company: "",
        Name: "",
      },
      departOptions: [],
      tempId: 0,
      localStars: stars,
      interId: 0,
      canJoinActive: true,
      localUserInfo: null,
      isCachedUserinfo: false,
    };
  },
  components: {},
  created() {
    document.title = "外服工会猜谜活动";
  },
  mounted() {
    this.initBg();
    this.initStatus();
    this.initDeparts();
    this.initCanvas();
    this.initDatas();
  },
  /* eslint-disable*/
  methods: {
    //查看个人的提交状态
    initStatus() {
      this.localUserInfo = localStorage.getItem("userInfo-lanternRddle")
        ? JSON.parse(localStorage.getItem("userInfo-lanternRddle"))
        : null;
      if (this.localUserInfo && this.localUserInfo.personxh) {
        const form = new FormData();
        form.set("Xh", this.localUserInfo.personxh);
        ajax
          .post("/Yuanxiao/GetInfoByXh", form)
          .then((res) => {
            const data = res.data;
            if (data.Code === 1) {
              this.localUserInfo.score = data.Score || 0;
              this.localUserInfo.count = data.Count || 0;
              localStorage.removeItem("userInfo-lanternRddle");
              localStorage.setItem(
                "userInfo-lanternRddle",
                JSON.stringify(this.localUserInfo)
              );
              if (
                this.localUserInfo.count >= 2 ||
                (this.localUserInfo.score >= 6 && this.localUserInfo.count > 0)
              ) {
                this.canJoinActive = false;
              } else {
                this.canJoinActive = true;

                this.form.Company = this.localUserInfo.company;
                this.form.Name = this.localUserInfo.name;
              }
            }
          })
          .catch((err) => {
            console.log("err", err);
          });
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
    /* eslint-disable*/
    initDatas() {
      ajax
        .get("/Yuanxiao/GetAll")
        .then((res) => {
          const data = res.data;
          // let data = [{Xh:'38'},{Xh:'18'},{Xh:'42'}];
          // for(let i =41;i<42;i++){
          //   data.push({
          //     Xh:i+1+''
          //   })
          // }
          let tempSet = new Map();
          data.forEach((item) => {
            tempSet.set(item.Xh, item.Xh);
            // this.addToList(item.Xh, item.FlagContent);
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
      let personxh = 0;
      if (this.localUserInfo) {
        personxh = this.localUserInfo.personxh
          ? this.localUserInfo.personxh
          : 0;
      }
      this.canvasCtx.clearRect(0, 0, 750, 720); // clear canvas
      this.localStars.forEach((item) => {
        const img = new Image();
        if (item.status === true) {
          //如果是自己的星星,展示黄色
          if (personxh === item.id.toString()) {
            img.src = highlightActivatedLantern;
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
            img.src = activatedLantern;
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
      console.log(this.form);
      this.modalShow = true;
    },
    save() {
      if (this.form.Company.trim() === "") {
        alert("请填写您的部门");
        return;
      }
      if (this.form.Name.trim() === "") {
        alert("请填写您的姓名");
        return;
      }
      /* eslint-disable*/
      this.form.Name = this.form.Name.replace(/\n|\r/g, "");

      this.form.Name = this.form.Name.replace(/\"/g, "“");

      const postForm = new FormData();
      postForm.append("Company", this.form.Company);
      postForm.append("Name", this.form.Name);
      ajax
        .post("/Yuanxiao/GetStatus", postForm)
        .then((res) => {
          const data = res.data;

          if (data.Code === 1) {
            let userInfo = {
              name: this.form.Name,
              company: this.form.Company,
              personxh: data.Xh,
              count: 0,
              score: 0,
            };
            localStorage.setItem(
              "userInfo-lanternRddle",
              JSON.stringify(userInfo)
            );
            this.$router.push({
              path: "./yuanxiao/topic",
            });
            // this.addToList(tempId, this.form.FlagContent);
            // this.reDrawStars(data.Xh);
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
    stopPropagation(e) {
      e.stopPropagation();
    },
  },
};
</script>

<style lang="less">
#lanternRddle {
  .bg {
    background: url("../../assets/lanternRddle/bg.png");
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
    padding-top: 20px;
    // .danmu {
    //   height: 200px;
    //   position: relative;
    //   .content {
    //     height: 60px;
    //     text-align: center;
    //     // background: #ffffff;
    //     border-radius: 30px;
    //     font-size: 30px;
    //     font-family: PingFang SC;
    //     font-weight: 400;
    //     line-height: 60px;
    //     padding: 0px 15px;
    //     color: #ffffff;
    //   }
    // }
    .logo-wrap {
      position: relative;
      width: 750px;
      height: 640px;
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
      margin-top: 90px;
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
          color: #a61d31;
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
    // background-image: url("../../assets/lanternRddle/bg.png");
    // background-repeat: no-repeat;
    // background-size: cover;
    display: flex;
    justify-content: center;
    opacity: 1;
    .blur_bj {
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("../../assets/lanternRddle/bg.png");
      background-repeat: no-repeat;
      background-size: cover;
      -webkit-filter: blur(10px);
      -moz-filter: blur(10px);
      -o-filter: blur(10px);
      -ms-filter: blur(10px);
      filter: blur(10px) brightness(50%);
    }
    .dialog {
      margin-top: 208px;
      width: 640px;
      height: 588px;
      background: #ffffff;
      opacity: 1;
      border-radius: 24px;
      .wrap {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        input {
          border-radius: 200px;
        }
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
        -webkit-appearance: none;
        width: 580px;
        height: 70px;
        background: #f4f4f4;
        border: 1px solid #707070;
        border-radius: 200px;
        padding: 0 20px;
      }
      .name {
        box-sizing: border-box;
        width: 580px;
        padding: 0 20px;
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
        margin-top: 72px;
        display: flex;
        justify-content: center;
        align-items: center;
        .btn {
          width: 560px;
          height: 90px;
          background: #a61d31;
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
