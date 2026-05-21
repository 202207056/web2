var express = require('express');
var router = express.Router();
var {getConnection} = require('./connect');
var oracledb = require('oracledb');

/* 로그인 페이지 */
router.get('/login', function(req, res, next) {
  res.render('index', {title:'로그인', pageName:'login.ejs'});
});

router.post('/login', async function(req, res){
  const scode = req.body.scode;
  let con;
  try{
      con = await getConnection();
      let sql="select * from students where scode=:scode";
      let result= await con.execute(sql, {scode}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
      console.log(result.rows[0]);
      res.send(result.rows[0]);
  }catch(err){
      console.log('로그인체크', err.message);
  }finally{
      if(con) await con.close(); 
  }
});

module.exports = router;
