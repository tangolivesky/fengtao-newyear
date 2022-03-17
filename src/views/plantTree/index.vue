<template>
  <div id="planttree">
    <div class="bg" id="bg"></div>
    <div class="content">
      <!-- <div class="danmu"></div> -->
      <div class="logo-wrap">
        <div v-show="pageShow">
          <img class="logo" src="../../assets/plantTree/tree.png" />
          <canvas
            class="canvas"
            width="750"
            height="780"
            id="starCanvas"
          ></canvas>
        </div>
        <div class="sheep"></div>
      </div>

      <div class="bottom">
        <div class="plant_tree_btn" @click="plantTree" v-if="canJoinActive"></div>
      </div>
    </div>
    <div class="modal" v-show="modalShow" @click="closeDlg">
      <div class="blur_bj"></div>
      <div class="dialog" @click="stopPropagation($event)">
        <div v-show="step == 1">
          <div class="title">部门</div>
          <div class="wrap">
            <select
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
              placeholder="请填写您的姓名"
              v-model="form.Name"
              type="text"
              class="name"
            />
          </div>
          <div class="title">电话</div>
          <div class="wrap">
            <input
              placeholder="请填写您的电话号码"
              v-model="form.Phone"
              type="text"
              class="common"
            />
          </div>
          <div class="title">收件地址</div>
          <div class="wrap">
            <input
              placeholder="请填写您的收件地址"
              v-model="form.Address"
              type="text"
              class="common"
            />
          </div>
        </div>
        <div v-show="step == 2">
          <div class="title">请写下你对阿克苏地区的祝福</div>
          <div class="wrap">
            <textarea
              placeholder="请写下祝福，含标点符号20字以内"
              v-model="form.Content"
              type="text"
              class="textarea"
            >
            </textarea>
          </div>
        </div>
        <div class="btn-wrap">
          <div class="btn" v-on:click="nexStep">
            <div class="txt">{{ btnText }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ajax from "../../core/ajax";
import apples from "./apple";
import redAppleImg from "../../assets/plantTree/red.png";
import yellowAppleImg from "../../assets/plantTree/yellow.png";
import bgImg from "../../assets/plantTree/bg.png";
import departs from "./depart.json";

export default {
  name: "App",
  data() {
    return {
      localUserInfo: {},
      pageShow: true,
      canvasObj: null,
      canvasCtx: null,
      localApples: apples,
      departOptions: [],
      modalShow: false,
      form: {
        Company: "",
        Name: "",
        Phone: "",
        Address: "",
        Content: "",
      },
      step: 1,
      btnText: "种下一棵树",
      canJoinActive: false,
    };
  },
  components: {},
  created() {
    document.title = "外服工会公益植树活动";
  },
  mounted() {
    this.initStatus();
    this.initDatas();
    this.initBg();
    this.initDeparts();
    this.initCanvas();
    // this.drawApples();
  },
  methods: {
    initStatus() {
      this.localUserInfo = localStorage.getItem("userInfo-plant-tree")
        ? JSON.parse(localStorage.getItem("userInfo-plant-tree"))
        : {};
      if (this.localUserInfo && this.localUserInfo.personxh) {
        const form = new FormData();
        form.set("Xh", this.localUserInfo.personxh);
        ajax
          .post("/Tree/GetStatusByXh", form)
          .then((res) => {
            const data = res.data;
            if (data.Code === 1) {
              this.canJoinActive = data.Status == 1 ? false : true;
            }
          })
          .catch((err) => {
            console.log("err", err);
          });
      }else{
        this.canJoinActive = true
      }
    },
    initDatas() {
      ajax
        .get("/Tree/GetAll")
        .then((res) => {
          const data = res.data.datas;
          let tempSet = new Map();
          data.forEach((item) => {
            tempSet.set(item.Xh, item.Xh);
          });
          this.localApples = this.localApples.map((apples) => {
            if (tempSet.has(apples.id.toString())) {
              apples.status = true;
            }
            return apples;
          });
          this.drawApples();
        })
        .catch((err) => {
          console.log("err", err);
        });
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
      };
    },
    departChange(event) {
      this.form.Company = event.target.value;
    },
    //画星星，需要调用接口获取已经点亮的星星
    drawApples() {
      const personxh = this.localUserInfo.personxh || "";
      this.canvasCtx.clearRect(0, 0, 750, 720); // clear canvas
      this.localApples.forEach((item) => {
        const img = new Image();
        if (item.status === true) {
          //如果是自己的星星,展示黄色
          if (personxh == item.id) {
            img.src = yellowAppleImg;
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
            img.src = redAppleImg;
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
      });
    },
    plantTree() {
      this.modalShow = true;
    },
    stopPropagation(e) {
      e.stopPropagation();
    },
    nexStep() {
      if (this.step == 1) {
        if (this.form.Company.trim() === "") {
          alert("请填写您的部门");
          return;
        }
        if (this.form.Name.trim() === "") {
          alert("请填写您的姓名");
          return;
        }
        if (this.form.Phone.trim() === "") {
          alert("请填写您的电话号码");
          return;
        }
        if (this.form.Address.trim() === "") {
          alert("请填写您的收件地址");
          return;
        }
        this.btnText = "写下祝福";
      }
      if (this.step == 2) {
        if (this.form.Content.trim() === "") {
          alert("请填写您的祝福");
          return;
        }
        this.submit();
        return;
      }
      this.step++;
    },
    submit() {
      console.log(this.form);
      const postForm = new FormData();
      postForm.append("Company", this.form.Company);
      postForm.append("Name", this.form.Name);
      postForm.append("Phone", this.form.Phone);
      postForm.append("Address", this.form.Address);
      postForm.append("Content", this.form.Content);
      ajax
        .post("Tree/UpdateContent", postForm)
        .then((res) => {
          const data = res.data;
          if (data.Code === 1) {
            this.modalShow = false;
            this.canJoinActive = false;
            this.initDatas();
            alert('提交成功');
            this.setStorage(data);
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
    closeDlg() {
      this.modalShow = false;
      this.step = 1;
      this.form = {
        Company: "",
        Name: "",
        Phone: "",
        Address: "",
        Content: "",
      };
    },
    setStorage(data) {
      this.localUserInfo.personxh = data.Xh;
      localStorage.setItem(
        "userInfo-plant-tree",
        JSON.stringify(this.localUserInfo)
      );
    },
  },
};
</script>

<style lang="less">
#planttree {
  .bg {
    background: url("../../assets/plantTree/bg.png") no-repeat center center;
    background-size: cover;
    background-attachment: fixed; //当页面的其余部分滚动时，背景图像不会移动。
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }
  .content {
    .danmu {
      height: 360px;
      position: relative;
    }
    .logo-wrap {
      position: relative;
      width: 750px;
      margin-top: 308px;
      .logo {
        width: 750px;
        height: 780px;
      }
      .canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 750px;
        height: 780px;
        z-index: 99;
      }
      .sheep {
        position: absolute;
        width: 238px;
        height: 208px;
        background: url("../../assets/plantTree/sheep.png") no-repeat center
          center;
        background-size: cover;
        bottom: -70px;
        right: 80px;
      }
    }
    .bottom {
      margin-top: 70px;
      display: flex;
      justify-content: center;
      .plant_tree_btn {
        width: 480px;
        height: 108px;
        background: url("../../assets/plantTree/plant-tree-icon.png");
        background-size: cover;
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
    flex-direction: column;
    align-items: center;
    opacity: 1;
    .blur_bj {
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("../../assets/plantTree/bg.png");
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
      background: #ffffff;
      opacity: 1;
      border-radius: 24px;
      padding-bottom: 40px;
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
      .name,
      .common {
        box-sizing: border-box;
        width: 580px;
        padding: 0 20px;
        height: 70px;
        background: #f4f4f4;
        border: 1px solid #707070;
      }
      .textarea {
        width: 580px;
        height: 344px;
        background: #f4f4f4;
        border-radius: 24px 24px 24px 24px;
        opacity: 1;
        border: 1px solid #707070;
        padding: 10px 34px;
        box-sizing: border-box;
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
          background: #029b38;
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
