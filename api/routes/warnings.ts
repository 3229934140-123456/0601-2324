import { Router, type Request, type Response } from 'express';
import { dataStore } from '../src/data/store.js';
import type { WarningLevel, WarningStatus } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const level = req.query.level ? parseInt(req.query.level as string) as WarningLevel : undefined;
    const status = req.query.status as WarningStatus | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;

    const result = dataStore.getWarnings(level, status, page, size);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取预警列表失败' });
  }
});

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const warning = dataStore.getWarningDetail(id);

    if (!warning) {
      res.status(404).json({ error: '预警不存在' });
      return;
    }

    res.json(warning);
  } catch (error) {
    res.status(500).json({ error: '获取预警详情失败' });
  }
});

router.post('/:id/rectification', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (!plan) {
      res.status(400).json({ error: '整改方案不能为空' });
      return;
    }

    const success = dataStore.submitRectification(id, plan);

    if (!success) {
      res.status(404).json({ error: '预警不存在' });
      return;
    }

    res.json({ message: '整改方案已提交' });
  } catch (error) {
    res.status(500).json({ error: '提交整改方案失败' });
  }
});

router.post('/:id/review', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { approved, comment } = req.body;

    if (approved === undefined) {
      res.status(400).json({ error: '审批结果不能为空' });
      return;
    }

    const success = dataStore.reviewWarning(id, approved, comment || '');

    if (!success) {
      res.status(404).json({ error: '预警不存在' });
      return;
    }

    res.json({ message: approved ? '复核通过' : '复核驳回' });
  } catch (error) {
    res.status(500).json({ error: '复核失败' });
  }
});

router.post('/:id/approve', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { approved, comment } = req.body;

    if (approved === undefined) {
      res.status(400).json({ error: '审批结果不能为空' });
      return;
    }

    const success = dataStore.approveWarning(id, approved, comment || '');

    if (!success) {
      res.status(404).json({ error: '预警不存在' });
      return;
    }

    res.json({ message: approved ? '批准通过' : '申请驳回' });
  } catch (error) {
    res.status(500).json({ error: '审批失败' });
  }
});

export default router;
