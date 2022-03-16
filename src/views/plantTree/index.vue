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
        <div class="sheep">

        </div>
      </div>

      <div class="bottom">

        <div class="plant_tree">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//import ajax from "../../core/ajax";
import apples from "./apple";
import redAppleImg from "../../assets/plantTree/red.png";
import yellowAppleImg from "../../assets/plantTree/yellow.png";
import bgImg from "../../assets/plantTree/bg.png";
import departs from "./depart.json";

export default {
  name: "App",
  data() {
    return {
      pageShow: true,
      canvasObj: null,
      canvasCtx: null,
      localApples: apples,
      departOptions: [],
    };
  },
  components: {},
  created() {
    document.title = "外服工会公益植树活动";
  },
  mounted() {
    this.initBg();
    this.initDeparts();
    this.initCanvas();
    this.drawApples();
  },
  methods: {
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
      const personxh = localStorage.getItem("personxh");
      this.canvasCtx.clearRect(0, 0, 750, 720); // clear canvas
      console.log("this.localApples", this.localApples);
      this.localApples.forEach((item) => {
        const img = new Image();
        if (item.status === true) {
          //如果是自己的星星,展示黄色
          if (personxh === item.id.toString()) {
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
      });
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
      .sheep{
        position: absolute;
        width: 238px;
        height: 208px;
        background: url("../../assets/plantTree/sheep.png") no-repeat center center;
        background-size: cover;
        bottom: -70px;
        right: 80px;
      }
    }
    .bottom{
      position: relative;
    }
  }
}
</style>
