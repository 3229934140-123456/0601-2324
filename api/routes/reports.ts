import { Router, type Request, type Response } from 'express';
import { dataStore } from '../src/data/store.js';
import type { ReportType } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const type = req.query.type as ReportType | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;

    const result = dataStore.getReports(type, page, size);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取报告列表失败' });
  }
});

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const report = dataStore.getReportDetail(id);

    if (!report) {
      res.status(404).json({ error: '报告不存在' });
      return;
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: '获取报告详情失败' });
  }
});

router.post('/generate', (req: Request, res: Response): void => {
  try {
    const { type, period } = req.body;

    if (!type || !period) {
      res.status(400).json({ error: '类型和周期不能为空' });
      return;
    }

    res.json({ reportId: 'r' + Date.now() });
  } catch (error) {
    res.status(500).json({ error: '生成报告失败' });
  }
});

export default router;
