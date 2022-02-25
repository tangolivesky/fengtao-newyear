<template>
  <div class="result_container">
    <div class="img_box">
      <img v-if="score >= 6" src="@/assets/lanternRddle/success.png" alt="" />
      <img v-if="score < 6" src="@/assets/lanternRddle/fail.png" alt="" />
    </div>
    <div class="text_content">
      <div class="main_title">{{ mainTitle }}</div>
      <div class="des">{{ des }}</div>
    </div>

    <div class="btn">
      <button @click="goBack" v-if="score >= 6">点亮灯笼</button>
      <button @click="restart" v-if="score < 6 && count < 2">再答一次</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mainTitle: "",
      des: "",
      score: 0,
      count: 2,
    };
  },
  mounted() {
    this.score = this.$route.query.score;
    this.count = this.$route.query.count;
    this.mainTitle = this.score >= 6 ? "恭喜你，猜谜成功" : "很遗憾，猜谜失败";
    this.des =
      this.score >= 6
        ? "机智如你，猜谜答对6题以上，点击按钮可点亮专属灯笼"
        : "猜谜答对6题以上，就可点亮专属灯笼，再试一次吧";
    this.des = this.count >= 2 ? "" : this.des;
  },
  methods: {
    goBack() {
      this.$router.push({
        name: "lanternRddle",
      });
    },
    restart() {
      this.$router.push({
        name: "Topic",
      });
    },
  },
};
</script>

<style lang='less' scoped>
.result_container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160px;
  .img_box {
    width: 196px;
    img {
      width: 100%;
    }
  }
  .text_content {
    margin-top: 76px;
    text-align: center;
    .main_title {
      font-size: 36px;
      font-weight: 800;
      color: #222222;
    }
    .des {
      width: 432px;
      margin-top: 22px;
      font-size: 28px;
      font-weight: 400;
      color: #999999;
    }
  }
  .btn {
    margin-top: 152px;
    button {
      width: 560px;
      height: 90px;
      background: rgba(166, 29, 49, 1);
      border-radius: 200px;
      border: none;
      color: #fff;
    }
  }
}
</style>