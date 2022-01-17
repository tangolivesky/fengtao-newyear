<template>
  <div id="haibaoPage">
    <div class="haibao">
      <div class="bg" id="bg"></div>
      <div class="search-wrap">
        <div class="search">
          <img src="../../assets/haibao/search.png" />
          <input type="text" />
        </div>
      </div>
      <div class="haibao-list">
        <div
          class="haibao"
          v-for="(item, index) in haibaoList"
          v-bind:key="index"
        >
          <img class="img" :src="item.img" />
          <div class="content">
            <div class="row1">
              <div class="name">{{ item.name }}</div>
              <div class="like" :class="{ isLike: item.isLike }">
                <img
                  class="img"
                  v-if="!item.isLike"
                  src="../../assets/haibao/heart2.png"
                />
                <img
                  class="img"
                  v-if="item.isLike"
                  src="../../assets/haibao/heart.png"
                />
              </div>
            </div>
            <div class="row2">
              <div class="depart">{{ item.depart }}</div>
              <div class="likeNum" :class="{ isLike: item.isLike }">
                {{ item.likeNum }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="btn-wrap">
        <div v-on:click="btnOpenModal" class="btn">我的海报</div>
      </div>
    </div>
    <div class="modal" v-show="modalShow">
      <div class="dialog">
        <div class="title">部门</div>
        <div class="wrap">
          <select
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
        <div class="title">手机号</div>
        <div class="wrap">
          <input
            placeholder="请填写您的手机号"
            v-model="form.Phone"
            type="text"
            class="name"
          />
        </div>
        <div class="title">上传海报</div>
        <div class="wrap2">
          <div v-show="hasUpload" class="upload-img" v-on:click="uploadClick">
            <img :src="uploadImg" />
          </div>
          <div v-show="!hasUpload" class="upload-area" v-on:click="uploadClick">
            <img src="../../assets/haibao/add.png" />
          </div>
          <input
            style="display: none"
            ref="inputFile"
            type="file"
            accept="image/*"
          />
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
import departs from "./depart.json";
import ajax from "../../core/ajax";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

export default {
  name: "App",
  data() {
    return {
      haibaoList: [],
      modalShow: false,
      form: {
        Company: "",
        Name: "",
        ImageUrl: "",
      },
      uploadImg: "",
      uploadFile: null,
      departOptions: [],
      hasUpload: false,
      ossConfig: {
        accessid: "",
        policy: "",
        signature: "",
        dir: "",
        host: "",
      },
    };
  },
  components: {},
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.initFakeDate();
      this.initDeparts();
      this.initOss();
    },
    initOss() {
      ajax
        .get("/Poster/GetPolicyToken")
        .then((res) => {
          const data = res.data;
          if (data.Code === 1) {
            const tempJson = JSON.parse(data.Msg);
            this.ossConfig = { ...tempJson };
            console.log("this.ossConfig", this.ossConfig);
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    initHeight() {},
    initFakeDate() {
      const templist = [
        {
          img: "https://wf-appoint.oss-cn-hangzhou.aliyuncs.com/76/81522b4a-2fe6-49fb-b226-3407f69798fb1615392609293",
          name: "张春阳",
          depart: "杭州分公司",
          isLike: false,
          likeNum: 20,
        },
        {
          img: "https://wf-appoint.oss-cn-hangzhou.aliyuncs.com/76/81522b4a-2fe6-49fb-b226-3407f69798fb1615392609293",
          name: "张春阳",
          depart: "杭州分公司",
          isLike: true,
          likeNum: 20,
        },
        {
          img: "https://wf-appoint.oss-cn-hangzhou.aliyuncs.com/76/81522b4a-2fe6-49fb-b226-3407f69798fb1615392609293",
          name: "张春阳",
          depart: "杭州分公司",
          isLike: true,
          likeNum: 20,
        },
        {
          img: "https://wf-appoint.oss-cn-hangzhou.aliyuncs.com/76/81522b4a-2fe6-49fb-b226-3407f69798fb1615392609293",
          name: "张春阳",
          depart: "杭州分公司",
          isLike: true,
          likeNum: 20,
        },
        {
          img: "https://wf-appoint.oss-cn-hangzhou.aliyuncs.com/76/81522b4a-2fe6-49fb-b226-3407f69798fb1615392609293",
          name: "张春阳",
          depart: "杭州分公司",
          isLike: true,
          likeNum: 20,
        },
        {
          img: "https://wf-appoint.oss-cn-hangzhou.aliyuncs.com/76/81522b4a-2fe6-49fb-b226-3407f69798fb1615392609293",
          name: "张春阳",
          depart: "杭州分公司",
          isLike: true,
          likeNum: 20,
        },
      ];
      this.haibaoList = templist;
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
    initFileChange() {
      this.$refs.inputFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        this.uploadFile = file;
        let re = new FileReader();
        re.readAsDataURL(file);
        re.onload = (result) => {
          this.uploadImg = result.target.result;
          this.hasUpload = true;
        };
      });
    },
    btnOpenModal() {
      this.modalShow = true;
      this.initFileChange();
    },
    departChange(event) {
      this.form.Company = event.target.value;
    },
    uploadClick() {
      this.$refs.inputFile.click();
    },
    async save() {
      //先上传图片看看ok不ok
      const filekey = await this.uploadHttp(this.uploadFile);
      console.log("filekey",filekey);
    },
    async uploadHttp(file) {
      const filekey = "haibao/"+uuidv4();
      const formData = new FormData();
      formData.append("signature", this.ossConfig.signature || "");
      formData.append("OSSAccessKeyId", this.ossConfig.accessid || "");
      formData.append("policy", this.ossConfig.policy || "");
      formData.append("key", filekey);
      formData.append("file", file);
      const res = await axios({
        url: "http://"+this.ossConfig.host,
        method: "POST",
        data: formData,
      });

      if (res.status === 204) {
        return filekey;
      } else {
        throw new Error("错误");
      }
    },
    modalClose() {
      this.modalShow = false;
    },
  },
};
</script>

<style lang="less" scoped>
.haibao {
  position: relative;
  .bg {
    background: url("../../assets/haibao/bg.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
  }
  .search-wrap {
    margin-top: 320px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    .search {
      width: 700px;
      height: 70px;
      background: #ffffff;
      opacity: 1;
      border-radius: 40px;
      display: flex;
      align-items: center;
      img {
        width: 36px;
        height: 36px;
        margin-left: 40px;
      }
      input {
        margin-left: 20px;
        width: 500px;
        height: 50px;
        border: 0; // 去除未选中状态边框
        outline: none; // 去除选中状态边框
      }
    }
  }
  .haibao-list {
    display: flex;
    padding: 0px 24px;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 24px;
    height: calc(100vh - 580px);
    overflow-y: scroll;
    padding-bottom: 30px;
    .haibao {
      width: 340px;
      height: 500px;
      border-radius: 24px;
      overflow: hidden;
      margin-bottom: 22px;
      display: flex;
      flex-direction: column;
      .img {
        width: 340px;
        height: 368px;
      }
      .content {
        height: 132px;
        background-color: #ffffff;
        .row1 {
          display: flex;
          margin: 0px 24px;
          justify-content: space-between;
          margin-top: 20px;
          .name {
            font-size: 30px;
            font-weight: bold;
            line-height: 42px;
            color: #222222;
          }
          .like {
            .img {
              width: 40px;
              height: 36px;
            }
          }
        }
        .row2 {
          display: flex;
          padding-top: 10px;
          margin: 0px 24px;
          justify-content: space-between;
          align-items: center;
          .depart {
            font-size: 24px;
            font-weight: 400;
            line-height: 34px;
            color: #999999;
          }
          .likeNum {
            font-size: 24px;
            font-family: PingFang SC;
            font-weight: 400;
            line-height: 34px;
            color: #999999;
            margin-right: 6px;
          }
        }
      }
    }
  }
  .btn-wrap {
    display: flex;
    justify-content: center;
    align-content: center;
    position: relative;
    margin-top: 26px;
    .btn {
      width: 520px;
      height: 90px;
      background: #fff;
      box-shadow: 0px 8px 20px #c35901;
      opacity: 1;
      border-radius: 200px;
      text-align: center;
      font-size: 40px;
      font-weight: bold;
      line-height: 90px;
      color: #222222;
      opacity: 1;
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
    margin-top: 68px;
    width: 640px;
    height: 900px;
    background: #ffffff;
    opacity: 1;
    border-radius: 24px;
    padding-top: 40px;
    .wrap {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .wrap2 {
      margin-top: 16px;
      display: flex;
    }
    .upload-img {
      margin-left: 44px;
      width: 180px;
      height: 180px;
      border-radius: 20px;
      overflow: hidden;
      img {
        width: 180px;
        height: 180px;
      }
    }
    .upload-area {
      margin-left: 44px;
      width: 180px;
      height: 180px;
      background: rgba(244, 244, 244, 0.39);
      border: 1px solid #707070;
      opacity: 1;
      border-radius: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 92px;
        height: 92px;
      }
    }

    .title {
      padding-left: 60px;
      margin-top: 20px;
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
        background: #c35901;
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
</style>