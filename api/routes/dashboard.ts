import { Router, type Request, type Response } from 'express';
import { dataStore } from '../src/data/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/overview', (req: Request, res: Response): void => {
  try {
    const overview = dataStore.getDashboardOverview(req.user);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: '获取概览数据失败' });
  }
});

router.get('/provinces', (req: Request, res: Response): void => {
  try {
    const provinces = dataStore.getProvinces(req.user);
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ error: '获取省份数据失败' });
  }
});

router.get('/hospitals', (req: Request, res: Response): void => {
  try {
    const provinceId = req.query.provinceId as string | undefined;
    const hospitals = dataStore.getHospitals(provinceId, req.user);
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ error: '获取医院列表失败' });
  }
});

router.get('/ranking', (req: Request, res: Response): void => {
  try {
    const type = (req.query.type as 'infection' | 'usage') || 'infection';
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;

    const result = dataStore.getHospitalRanking(type, page, size, req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取排名数据失败' });
  }
});

router.get('/trend', (req: Request, res: Response): void => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const provinceId = req.query.provinceId as string | undefined;
    const hospitalId = req.query.hospitalId as string | undefined;

    const trendData = dataStore.getTrendData(days, provinceId, hospitalId, req.user);
    res.json(trendData);
  } catch (error) {
    res.status(500).json({ error: '获取趋势数据失败' });
  }
});

router.get('/drug-categories', (req: Request, res: Response): void => {
  try {
    const provinceId = req.query.provinceId as string | undefined;
    const hospitalId = req.query.hospitalId as string | undefined;

    const categories = dataStore.getDrugCategories(provinceId, hospitalId, req.user);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: '获取药物类别数据失败' });
  }
});

router.get('/level-averages', (req: Request, res: Response): void => {
  try {
    const averages = dataStore.getLevelAverages();
    res.json(averages);
  } catch (error) {
    res.status(500).json({ error: '获取等级均值失败' });
  }
});

export default router;
