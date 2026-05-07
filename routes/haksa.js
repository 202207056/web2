var express = require('express');
var router = express.Router();
var {getConnection} = require('./connect');
var oracledb = require('oracledb');

/* 교수관리 페이지 */
router.get('/pro', function(req, res, next) {
  res.render('index', {title:'교수관리', pageName:'haksa/professors.ejs'});
});

/* 교수 데이터 생성 */
router.get('/pro/list.json', async function(req, res){
  var con;
  try{
     con = await getConnection();
     const sql="select p.*, to_char(hiredate, 'YYYY-MM-DD') fdate, to_char(salary, '999,999,999') fsalary from professors p";
     const result = await con.execute(sql, {}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
     res.send(result.rows);
  }catch(err){
    
  }finally{
     if(con) await con.close();
  }
});

//교수등록 페이지
router.get('/pro/insert', async function(req, res){
    let code;
    let con;
    try{
        con = await getConnection();
        const sql="select max(pcode)+1 from professors";
        const result=await con.execute(sql);
        code = result.rows[0][0];
    }catch(err){

    }finally{
      if(con) await con.close();
    }
    res.render('index.ejs', {title:'교수등록', pageName:'haksa/professors_insert.ejs', code});
});

//교수등록
router.post('/pro/insert', async function(req, res){
    const pcode=req.body.pcode;
    const pname=req.body.pname;
    const dept=req.body.dept;
    const title=req.body.title;
    const hiredate=req.body.hiredate;
    const salary=req.body.salary;
    console.log(pcode, pname, dept, title, hiredate, salary);
    let con;
    try{
        con = await getConnection();
        let sql="insert into professors(pcode,pname,dept,title,hiredate,salary) ";
        sql += "values(:pcode,:pname,:dept,:title,:hiredate,:salary)";
        await con.execute(sql, {pcode, pname, dept, title, hiredate, salary},{autoCommit:true});
    }catch(err){

    }finally{
        if(con) await con.close();
    }
    res.sendStatus(200);
});

//교수 삭제
router.post('/pro/delete', async function(req, res){
    const pcode=req.body.pcode;
    let con;
    try{
        con = await getConnection();
        let sql="delete from professors where pcode=:pcode";
        await con.execute(sql, {pcode}, {autoCommit:true});
        res.sendStatus(200);
    }catch(err){
        res.sendStatus(500);
    }finally{
        if(con) await con.close();
    }
});


/* 학생관리 페이지 */
router.get('/stu', function(req, res, next) {
  res.render('index', {title:'학생관리', pageName:'haksa/students.ejs'});
});

/* 강좌관리 페이지 */
router.get('/cou', function(req, res, next) {
  res.render('index', {title:'강좌관리', pageName:'haksa/courses.ejs'});
});

module.exports = router;
