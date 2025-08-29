
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",

});

export default api;

//KISACA TEMEL GÖREVİ :
// Bu dosya, frontend ile backend arasındaki tüm HTTP isteklerinin temelini oluşturur.
// Axios ile http://localhost:8080/api tabanlı tek bir istemci yaratır ve bunu dışa aktarır. Böylece servis katmanı (events.ts vb.) bu istemciyi kullanarak backend ile konuşur.