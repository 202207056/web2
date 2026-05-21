var express = require('express');
var router = express.Router();
var {getConnection} = require('./connect');
const oracledb = require('oracledb');

//게시판
router.get('/', function(req, res, next){
    res.render('index', { title: '게시판', pageName: 'posts/list.ejs'});
});

//게시글 목록 데이터
router.get('/list.json', async function(req, res){
    let con;
    const page=parseInt(req.query.page);
    const size=parseInt(req.query.size);
    const off_rows = (page-1) * size;
    try{
        con = await getConnection();
        let sql = "select * from view_posts order by id desc "
            sql+= `offset ${off_rows} rows fetch next ${size} rows only`;
        let result = await con.execute(sql, {}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
        const list = result.rows;

        sql = "select count(*) from posts";
        result = await con.execute(sql);
        const count = result.rows[0][0];

        res.send({list, count});
    }catch(err){
        console.log('게시글 목록 데이터', err.message);
    }finally{
        if(con) await con.close();
    }
});

module.exports = router;