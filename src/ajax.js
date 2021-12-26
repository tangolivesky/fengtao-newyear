import axios from 'axios'

function getBaseURL() {
    let baseURL = ''
    switch (process.env.NODE_ENV) {
        case 'production':
            baseURL = 'http://zfsc-manage.hzdsinfo.com/Flag'
            break
        case 'development':
            baseURL = 'api/'
            break
        default:
            baseURL = 'api/'
    }
    return baseURL
}

const Axios = axios.create({
    // 请求前的数据处理
    baseURL: getBaseURL()
})

export default Axios