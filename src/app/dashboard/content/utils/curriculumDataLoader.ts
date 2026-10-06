import { Chapter } from '@/types/curriculum';
import { CurriculumDataSource } from '../components/CurriculumDataSourceBar';
import { normalizeCurriculumData } from './curriculumNormalize';

export async function fetchRemoteCurriculum(
  source: 'pb' | 'cdn',
  customDomain?: string
): Promise<Chapter[]> {
  const pbUrl = 'https://pb.vakrahara.org/api/amritam/curriculum?schema_version=2';
  const cdnUrl = source === 'cdn' && customDomain
    ? `${customDomain.replace(/\/$/, '')}/cbse/chapters_data.json`
    : 'https://cdn.vakrahara.org/v1/cbse/chapters_data.json';

  const targetUrl = source === 'pb' ? pbUrl : cdnUrl;
  const res = await fetch(targetUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();
  return normalizeCurriculumData(Array.isArray(data) ? data : []);
}
