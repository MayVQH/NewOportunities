import express from "express";
import {getAllThemes,createTheme,deleteTheme,updateTheme,getThemeQuestions,getFullThemeData,
    getRoles,updateRol,getAllThemesIndistict,updateMultipleThemes,createKeyQuestion,getAllKeyQuestions,
updateComentsKeyQuestion,getAllKeyQuestionUser,getFullKeyQuestionData,getComentsKeyQuestions,
createNewComment,createNewDocument,getUrlsKeyQuestions,createNewUrl,createNewAnswerKeyQuestion,
getReportKeyQuestions,getComentsKeyQuestionsUser,getUrlsKeyQuestionsUser,
getFullKeyQuestionDataDetail,getDocumentKeyQuestionsUser,getDocumentsKeyQuestions,
getAnswerKeyQuestionsUser,changeFinalChoose,FinalCommentKeyQuestion} from "../controllers/themeController.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });


const router = express.Router();

router.get('/', getAllThemes)
router.get('/getall',getAllThemesIndistict)
router.post('/',createTheme)
router.delete('/:id',deleteTheme)
router.put('/:id', updateTheme);
router.put('/tema/activateTheme',updateMultipleThemes)
router.get('/:id/questions', getThemeQuestions);
router.get('/full/:id', getFullThemeData);
router.get('/roles',getRoles)
router.put('/updatedroles/:idUsuario/:id',updateRol)
router.post('/crear/preguntaClave',createKeyQuestion)
router.get('/preguntaClave/all',getAllKeyQuestions)
router.put('/preguntaClave/comentario/:id',updateComentsKeyQuestion)
router.get('/preguntasClave/usuario/:id', getAllKeyQuestionUser)
router.get('/preguntasClave/usuario/full/:id', getFullKeyQuestionData)
router.get('/preguntasClave/comentarios/:id', getComentsKeyQuestions)
router.get('/preguntasClave/documentos/:id', getDocumentsKeyQuestions)
router.get('/preguntasClave/comentarios/:id/:user', getComentsKeyQuestionsUser)
router.get('/preguntasClave/documentos/:id/:user', getDocumentKeyQuestionsUser)
router.get('/preguntasClave/respuestas/:id', getAnswerKeyQuestionsUser)
router.post('/comentarios/guardar',createNewComment)
router.post('/documentos/guardar',upload.single('archivo'),createNewDocument)
router.get('/preguntasClave/enlaces/:id', getUrlsKeyQuestions)
router.get('/preguntasClave/enlaces/:id/:user', getUrlsKeyQuestionsUser)
router.post('/enlace/guardar',createNewUrl)
router.post('/preguntaClave/guardar/nuevo',createNewAnswerKeyQuestion)
router.post('/preguntaClave/guardar/respuestaFinal/:id', changeFinalChoose)
router.get('/preguntasClave/pregunta/full/:id', getReportKeyQuestions)
router.get('/preguntaClave/all/preguntas/preguntaClave/:pc_id/:pcp_id', getFullKeyQuestionDataDetail)
router.post('/preguntaClave/guardar/comentarioFinal/:id', FinalCommentKeyQuestion)




export default router;