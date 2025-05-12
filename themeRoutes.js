import express from "express";
import {getAllThemes,createTheme,deleteTheme,updateTheme,getThemeQuestions,getFullThemeData,
    getRoles,updateRol,getAllThemesIndistict,updateMultipleThemes,createKeyQuestion} from "../controllers/themeController.js";

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

export default router;