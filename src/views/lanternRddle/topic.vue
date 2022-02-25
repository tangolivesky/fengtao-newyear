<template>
  <div class="topic-container">
    <div class="topic-item">
      <div class="question">
        {{ currentIndex >= 9 ? "" : "0" }}{{ currentIndex + 1 }}.
        {{ questionList[currentIndex].Title }}
      </div>
      <div class="divider"></div>
      <div class="answer">
        <input
          type="text"
          placeholder="请输入答案"
          v-model="answerList[currentIndex]"
        />
      </div>
    </div>
    <div class="btn" @click="nextOperation">
      <button :class="{ disable: !answerList[currentIndex] }">
        {{ currentIndex == 9 ? "提交" : "下一题" }}
      </button>
    </div>
  </div>
</template>

<script>
import ajax from "@/core/ajax";
export default {
  data() {
    return {
      currentIndex: 0,
      questionList: ["天生我材必有用", "天下乌鸦一般黑"],
      answerList: [],
      userInfo: {},
    };
  },
  created() {
    document.title = "外服工会猜谜活动";
    this.getTiMu();
  },
  mounted() {
    let localUserInfo = localStorage.getItem("userInfo-lanternRddle");
    this.userInfo = localUserInfo ? JSON.parse(localUserInfo) : {};
    if (this.userInfo.count >= 2) {
      alert("参与次数已用完");
      this.$router.push({
        name: "lanternRddle",
      });
    }
  },
  methods: {
    nextOperation() {
      if (this.currentIndex == 9) {
        this.submit();
        return;
      }
      if (this.currentIndex < 9) {
        this.currentIndex++;
      }
    },
    getTiMu() {
      ajax.get("/Yuanxiao/GetTiMu").then((res) => {
        if (res.data.length > 0) {
          this.questionList = [...res.data];
        }
      });
    },
    submit() {
      const paramsForm = new FormData();
      let TiMu_Xh = [];
      let TiMu_Answer = this.answerList.join(",");
      this.questionList.forEach((item) => {
        TiMu_Xh.push(item.Xh);
      });
      paramsForm.append("Xh", this.userInfo.personxh);
      paramsForm.append("TiMu_Xh", TiMu_Xh.join(","));
      paramsForm.append("TiMu_Answer", TiMu_Answer);
      console.log(paramsForm);
      ajax.post("/Yuanxiao/DoSubmit", paramsForm).then((res) => {
        if (res.data.Code == 1) {
          this.userInfo.count = this.userInfo.count
            ? this.userInfo.count + 1
            : 1;
          this.userInfo.score = res.data.Score;
          localStorage.removeItem("userInfo-lanternRddle");
          localStorage.setItem(
            "userInfo-lanternRddle",
            JSON.stringify(this.userInfo)
          );
          this.$router.push({
            path: "./result",
            query: {
              score: res.data.Score,
              count: this.userInfo.count,
            },
          });
        } else {
          alert(res.data.Msg);
        }
      });
    },
  },
};
</script>

<style scoped lang='less'>
.topic-container {
  padding-top: 20px;
  height: 100vh;
  width: 100%;
  background: #f7f7f7;
  .topic-item {
    padding: 30px 48px;
    background-color: #fff;
    .question {
      font-size: 30px;
      font-weight: 400;
      line-height: 42px;
      color: #222222;
    }
    .divider {
      height: 1px;
      background: #e2e2e2;
      margin: 30px 0;
    }
    .answer {
      input {
        width: 100%;
        border: none;
        font-size: 30px;
        font-weight: 400;
        line-height: 42px;
        color: #222222;
      }
    }
  }
  .btn {
    text-align: center;
    margin-top: 120px;
    button {
      width: 560px;
      height: 90px;
      background: #a61d31;
      border-radius: 200px;
      border: none;
      color: #ffffff;
      font-size: 32px;
    }
    .disable {
      background: rgba(166, 29, 49, 0.39);
      opacity: 0.5;
    }
  }
}
</style>