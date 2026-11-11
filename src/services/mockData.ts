import type {
  MetaData,
  ProgramTrendResponse,
  ProgramTeachersResponse,
  TeacherDetailResponse,
  MethodologyResponse,
  DataQualityResponse,
  TeacherLoad,
  TeacherCourse,
} from '../types';

export const mockMeta: MetaData = {
  academic_years: [2567, 2566, 2565, 2564, 2563, 2562],
  terms: [1, 2],
  programs: [
    { code: 'Comp', name: 'วิทยาการคอมพิวเตอร์ (Computer Science)' },
    { code: 'DE', name: 'วิศวกรรมดิจิทัล (Digital Engineering)' },
    { code: 'DBiz', name: 'ธุรกิจดิจิทัล (Digital Business)' },
    { code: 'MsComp', name: 'ปริญญาโทวิทยาการคอมพิวเตอร์ (M.Sc. Computing)' },
    { code: 'AISE', name: 'วิศวกรรมปัญญาประดิษฐ์และระบบอัจฉริยะ (AISE)' },
  ],
  coc_programs: ['Comp', 'DE', 'DBiz', 'MsComp'],
  source_mode: 'google_sheets',
  cache_ttl_seconds: 300,
};

// Exact historical term and annual FTET data from CoC official sheets (2562 - 2567)
const RAW_TERM_DATA: Record<string, Record<string, number>> = {
  "Comp": {
    "2562_1": 0.53,
    "2562_2": 0.45,
    "AVG_2562": 0.49,
    "2563_1": 0.48,
    "2563_2": 0.35,
    "AVG_2563": 0.415,
    "2564_1": 0.51,
    "2564_2": 0.44,
    "AVG_2564": 0.475,
    "2565_1": 0.47,
    "2565_2": 0.36,
    "AVG_2565": 0.415,
    "2566_1": 0.45,
    "2566_2": 0.32,
    "AVG_2566": 0.385,
    "2567_1": 0.42,
    "2567_2": 0.51,
    "AVG_2567": 0.465
  },
  "DE": {
    "2562_1": 0.49,
    "2562_2": 0.51,
    "AVG_2562": 0.5,
    "2563_1": 0.48,
    "2563_2": 0.44,
    "AVG_2563": 0.46,
    "2564_1": 0.49,
    "2564_2": 0.51,
    "AVG_2564": 0.5,
    "2565_1": 0.42,
    "2565_2": 0.38,
    "AVG_2565": 0.4,
    "2566_1": 0.37,
    "2566_2": 0.32,
    "AVG_2566": 0.345,
    "2567_1": 0.44,
    "2567_2": 0.4,
    "AVG_2567": 0.42
  },
  "Dbiz": {
    "2562_1": 0.55,
    "2562_2": 0.37,
    "AVG_2562": 0.46,
    "2563_1": 0.43,
    "2563_2": 0.31,
    "AVG_2563": 0.37,
    "2564_1": 0.47,
    "2564_2": 0.3,
    "AVG_2564": 0.385,
    "2565_1": 0.52,
    "2565_2": 0.32,
    "AVG_2565": 0.42,
    "2566_1": 0.44,
    "2566_2": 0.28,
    "AVG_2566": 0.36,
    "2567_1": 0.54,
    "2567_2": 0.38,
    "AVG_2567": 0.46
  },
  "AISE": {
    "2567_1": 0.48,
    "2567_2": 0.44,
    "AVG_2567": 0.46
  },
  "MsComp": {
    "2562_1": 0.45,
    "2562_2": 0.41,
    "AVG_2562": 0.43,
    "2563_1": 0.48,
    "2563_2": 0.38,
    "AVG_2563": 0.43,
    "2564_1": 0.49,
    "2564_2": 0.43,
    "AVG_2564": 0.46,
    "2565_1": 0.43,
    "2565_2": 0.38,
    "AVG_2565": 0.405,
    "2566_1": 0.4,
    "2566_2": 0.34,
    "AVG_2566": 0.37,
    "2567_1": 0.5,
    "2567_2": 0.5,
    "AVG_2567": 0.5
  },
  "CoC": {
    "AVG_2562": 0.47,
    "AVG_2563": 0.4188,
    "AVG_2564": 0.455,
    "AVG_2565": 0.41,
    "AVG_2566": 0.365,
    "AVG_2567": 0.4612
  }
};

const TEACHER_COUNTS: Record<string, number> = {
  Comp: 12,
  DE: 19,
  DBiz: 6,
  MsComp: 10,
  AISE: 18,
};

export const getMockTrends = (
  yearFrom: number = 2562,
  yearTo: number = 2567,
  by: 'year' | 'term' = 'year'
): ProgramTrendResponse => {
  const cocPrograms = ['Comp', 'DE', 'DBiz', 'MsComp'];
  const allPrograms = ['Comp', 'DE', 'DBiz', 'MsComp', 'AISE'];
  const points = [];

  for (let y = yearFrom; y <= yearTo; y++) {
    if (by === 'term') {
      for (const term of [1, 2]) {
        const termKey = `${y}_${term}`;
        let cocSum = 0;
        let cocCount = 0;

        for (const prog of allPrograms) {
          const progDict = RAW_TERM_DATA[prog] || {};
          let val = progDict[termKey];
          if (val === undefined) {
            if (prog === 'AISE') continue;
            val = 0.40;
          }

          if (cocPrograms.includes(prog)) {
            cocSum += val;
            cocCount++;
          }

          points.push({
            program: prog,
            academic_year: y,
            term,
            ftet: Number(val.toFixed(4)),
            teacher_count: TEACHER_COUNTS[prog] || 10,
          });
        }

        // CoC aggregate
        const cocVal = RAW_TERM_DATA['CoC']?.[termKey] ?? (cocCount > 0 ? cocSum / cocCount : 0.45);
        points.push({
          program: 'CoC',
          academic_year: y,
          term,
          ftet: Number(cocVal.toFixed(4)),
          teacher_count: null,
          based_on: cocPrograms,
        });
      }
    } else {
      const avgKey = `AVG_${y}`;
      let cocSum = 0;
      let cocCount = 0;

      for (const prog of allPrograms) {
        const progDict = RAW_TERM_DATA[prog] || {};
        let val = progDict[avgKey];
        if (val === undefined) {
          if (prog === 'AISE') continue;
          val = 0.42;
        }

        if (cocPrograms.includes(prog)) {
          cocSum += val;
          cocCount++;
        }

        points.push({
          program: prog,
          academic_year: y,
          term: null,
          ftet: Number(val.toFixed(4)),
          teacher_count: TEACHER_COUNTS[prog] || 10,
          terms_included: [1, 2],
        });
      }

      const cocVal = RAW_TERM_DATA['CoC']?.[avgKey] ?? (cocCount > 0 ? cocSum / cocCount : 0.4613);
      points.push({
        program: 'CoC',
        academic_year: y,
        term: null,
        ftet: Number(cocVal.toFixed(4)),
        teacher_count: null,
        based_on: cocPrograms,
      });
    }
  }

  return {
    metric: 'FTET',
    unit: 'FTET ต่ออาจารย์ 1 ท่าน',
    by,
    from: yearFrom,
    to: yearTo,
    coc_programs: cocPrograms,
    count: points.length,
    data: points,
  };
};

// Exact Teachers per program extracted directly from CoC 2567 sheets
const RAW_TEACHERS_DATA: Record<string, { t1: any[]; t2: any[] }> = {
  "Comp": {
    "t1": [
      {
        "order": 2,
        "name": "ผศ.ดร.ขวัญกมล ดิฐกัญจน์",
        "ftet": 0.6857
      },
      {
        "order": 5,
        "name": "ผศ.ดร.ปาณิศา ตรีพงศ์",
        "ftet": 0.6571
      },
      {
        "order": 11,
        "name": "อ.มนชนก ทองเทพ",
        "ftet": 0.5714
      },
      {
        "order": 6,
        "name": "ดร.จักรพันธ์* (ผู้ประสานงาน)",
        "ftet": 0.4
      },
      {
        "order": 7,
        "name": "ดร.จิรวัฒน์ แท่นทอง",
        "ftet": 0.4
      },
      {
        "order": 9,
        "name": "ดร.วรวิกา วัฒนสุนทร",
        "ftet": 0.4
      },
      {
        "order": 10,
        "name": "ดร.อมรรัตน์ ประสิทธิ์ศุภโรจน์",
        "ftet": 0.4
      },
      {
        "order": 12,
        "name": "อ.อภิชาต วสุธาพิทักษ์",
        "ftet": 0.4
      },
      {
        "order": 3,
        "name": "ผศ.ดร.ณัฐพงศ์ ทองเทพ",
        "ftet": 0.3429
      },
      {
        "order": 1,
        "name": "ผศ.ดร.กาญจนา เหล่าเส็น",
        "ftet": 0.3143
      },
      {
        "order": 8,
        "name": "ดร.มณีเนตร พวงมณี",
        "ftet": 0.2857
      },
      {
        "order": 4,
        "name": "ผศ.ดร.นวนล* (ผู้ประสานงาน)",
        "ftet": 0.2286
      }
    ],
    "t2": [
      {
        "order": 11,
        "name": "ดร.อมรรัตน์ ประสิทธิ์ศุภโรจน์",
        "ftet": 0.9286
      },
      {
        "order": 2,
        "name": "ผศ.ดร.ขวัญกมล ดิฐกัญจน์",
        "ftet": 0.7429
      },
      {
        "order": 5,
        "name": "ผศ.ดร.ณัฐพงศ์ ทองเทพ",
        "ftet": 0.6571
      },
      {
        "order": 4,
        "name": "ผศ.ดร.จิรวัฒน์ แท่นทอง",
        "ftet": 0.5714
      },
      {
        "order": 8,
        "name": "ดร.มณีเนตร พวงมณี",
        "ftet": 0.5714
      },
      {
        "order": 3,
        "name": "ผศ.ดร.จักรพันธ์ เชาว์ปรีชา",
        "ftet": 0.5286
      },
      {
        "order": 1,
        "name": "ผศ.ดร.กาญจนา เหล่าเส็น",
        "ftet": 0.4571
      },
      {
        "order": 12,
        "name": "อ.มนชนก ทองเทพ",
        "ftet": 0.4286
      },
      {
        "order": 9,
        "name": "ดร.วรวิกา วัฒนสุนทร*",
        "ftet": 0.3286
      },
      {
        "order": 10,
        "name": "ดร.อภิชาต วสุธาพิทักษ์",
        "ftet": 0.3286
      },
      {
        "order": 6,
        "name": "ผศ.ดร.นวนล ธีระอัมพรพันธุ์*",
        "ftet": 0.2857
      },
      {
        "order": 7,
        "name": "ผศ.ดร.ปาณิศา ตรีพงศ์",
        "ftet": 0.2571
      }
    ]
  },
  "DE": {
    "t1": [
      {
        "order": 8,
        "name": "ดร.กฤตศิลป์ ศิลานนท์",
        "ftet": 0.6286
      },
      {
        "order": 6,
        "name": "ผศ.ดร.วโรดม วีระพันธ์",
        "ftet": 0.6
      },
      {
        "order": 17,
        "name": "อ.กุลศิริ จิรายุส",
        "ftet": 0.6
      },
      {
        "order": 7,
        "name": "ผศ.ดร.อดิศักดิ์ อินทนา*",
        "ftet": 0.579
      },
      {
        "order": 9,
        "name": "ดร.กุลจรี ตันตยกุล",
        "ftet": 0.5714
      },
      {
        "order": 10,
        "name": "ดร.จักรพันธ์ สัวบุตร",
        "ftet": 0.5429
      },
      {
        "order": 18,
        "name": "อ.พัชรี เทพนิมิตร",
        "ftet": 0.5143
      },
      {
        "order": 11,
        "name": "ดร.จามิกร หิรัญรัตน์ (OOP)",
        "ftet": 0.5067
      },
      {
        "order": 3,
        "name": "ผศ.ดร.คมสันต์ กาญจนสิทธิ์",
        "ftet": 0.4857
      },
      {
        "order": 13,
        "name": "ดร.ฐิตินันท์ เกลี้ยงสุวรรณ",
        "ftet": 0.4857
      },
      {
        "order": 15,
        "name": "ดร.วศิมน พาณิชพัฒนกุล",
        "ftet": 0.4857
      },
      {
        "order": 16,
        "name": "อ.กุลวรรธน์ เชาวนวาที",
        "ftet": 0.4286
      },
      {
        "order": 2,
        "name": "รศ.ดร.อภิชาติ หีดนาคราม",
        "ftet": 0.4
      },
      {
        "order": 4,
        "name": "ผศ.ดร.นพพณ เลิศชูวงศา",
        "ftet": 0.4
      },
      {
        "order": 14,
        "name": "ดร.ยศวีย์ แก้วมณี",
        "ftet": 0.3714
      },
      {
        "order": 1,
        "name": "รศ.ดร.อซีส นันทอมรพงศ์",
        "ftet": 0.3429
      },
      {
        "order": 19,
        "name": "อ.วิศรุต จันทระ",
        "ftet": 0.3143
      },
      {
        "order": 12,
        "name": "ดร.ฉกาจกิจ แท่นชัยกุล",
        "ftet": 0.1714
      },
      {
        "order": 5,
        "name": "ผศ.ดร.นรเทพ รัตนวิภานนท์",
        "ftet": 0.0
      }
    ],
    "t2": [
      {
        "order": 8,
        "name": "ผศ.ดร.นรเทพ รัตนวิภานนท์",
        "ftet": 0.6571
      },
      {
        "order": 10,
        "name": "ผศ.ดร.อดิศักดิ์ อินทนา",
        "ftet": 0.6571
      },
      {
        "order": 3,
        "name": "ผศ.ดร.กฤตศิลป์ ศิลานนท์",
        "ftet": 0.6286
      },
      {
        "order": 13,
        "name": "ดร.ยศวีย์ แก้วมณี",
        "ftet": 0.6
      },
      {
        "order": 4,
        "name": "ผศ.ดร.กุลจรี ตันตยกุล",
        "ftet": 0.5286
      },
      {
        "order": 6,
        "name": "ผศ.ดร.ฐิตินันท์ เกลี้ยงสุวรรณ",
        "ftet": 0.5143
      },
      {
        "order": 11,
        "name": "ดร.จักรพันธ์ สัวบุตร",
        "ftet": 0.4571
      },
      {
        "order": 9,
        "name": "ผศ.ดร.วโรดม วีระพันธ์",
        "ftet": 0.4429
      },
      {
        "order": 16,
        "name": "อ.กุลศิริ จิรายุส",
        "ftet": 0.4
      },
      {
        "order": 18,
        "name": "อ.วิศรุต จันทระ*",
        "ftet": 0.3857
      },
      {
        "order": 2,
        "name": "รศ.ดร.อภิชาต หีดนาคราม",
        "ftet": 0.3143
      },
      {
        "order": 17,
        "name": "อ.พัชรี เทพนิมิตร*",
        "ftet": 0.2857
      },
      {
        "order": 5,
        "name": "ผศ.ดร.คมสันต์ กาญจนสิทธิ์",
        "ftet": 0.2571
      },
      {
        "order": 14,
        "name": "ดร.วศิมน พาณิชพัฒนกุล",
        "ftet": 0.2571
      },
      {
        "order": 7,
        "name": "ผศ.ดร.นพพณ เลิศชูวงศา",
        "ftet": 0.2286
      },
      {
        "order": 12,
        "name": "ดร.ฉกาจกิจ แท่นชัยกุล",
        "ftet": 0.2286
      },
      {
        "order": 15,
        "name": "อ.กุลวรรธน์ เชาวนวาที",
        "ftet": 0.2286
      },
      {
        "order": 1,
        "name": "รศ.ดร.อซีส นันทอมรพงศ์",
        "ftet": 0.2
      }
    ]
  },
  "DBiz": {
    "t1": [
      {
        "order": 1,
        "name": "ผศ.ดร.วีราภรณ์ ซิดดู",
        "ftet": 0.8286
      },
      {
        "order": 5,
        "name": "อ.อยุทธย์ อินทรประดิษฐ์",
        "ftet": 0.6286
      },
      {
        "order": 4,
        "name": "อ.เลอลักษณ์ บุญล้ำ",
        "ftet": 0.6
      },
      {
        "order": 2,
        "name": "ดร.จามิกร หิรัญรัตน์ (OOP)",
        "ftet": 0.5067
      },
      {
        "order": 3,
        "name": "ดร.ณัฐยา แช่มธิติกุล",
        "ftet": 0.4286
      },
      {
        "order": 6,
        "name": "อ.เอสเธอร์ เสงี่ยมกุล",
        "ftet": 0.2571
      }
    ],
    "t2": [
      {
        "order": 4,
        "name": "อ.เลอลักษณ์ บุญล้ำ",
        "ftet": 0.5
      },
      {
        "order": 5,
        "name": "อ.อยุทธย์ อินทรประดิษฐ์",
        "ftet": 0.4571
      },
      {
        "order": 6,
        "name": "อ.เอสเธอร์ เสงี่ยมกุล",
        "ftet": 0.4286
      },
      {
        "order": 1,
        "name": "ผศ.ดร.วีราภรณ์ ซิดดู",
        "ftet": 0.3714
      },
      {
        "order": 2,
        "name": "ดร.จามิกร หิรัญรัตน์",
        "ftet": 0.3143
      },
      {
        "order": 3,
        "name": "ดร.ณัฐยา แช่มธิติกุล",
        "ftet": 0.2
      }
    ]
  },
  "AISE": {
    "t1": [
      {
        "order": 6,
        "name": "ดร.กฤตศิลป์ ศิลานนท์",
        "ftet": 0.6286
      },
      {
        "order": 18,
        "name": "อ.อยุทธย์ อินทรประดิษฐ์",
        "ftet": 0.6286
      },
      {
        "order": 4,
        "name": "ผศ.ดร.วโรดม วีระพันธ์",
        "ftet": 0.6
      },
      {
        "order": 15,
        "name": "อ.กุลศิริ จิรายุส",
        "ftet": 0.6
      },
      {
        "order": 5,
        "name": "ผศ.ดร.อดิศักดิ์ อินทนา*",
        "ftet": 0.579
      },
      {
        "order": 7,
        "name": "ดร.กุลจรี ตันตยกุล",
        "ftet": 0.5714
      },
      {
        "order": 8,
        "name": "ดร.จักรพันธ์ สัวบุตร",
        "ftet": 0.5429
      },
      {
        "order": 16,
        "name": "อ.พัชรี เทพนิมิตร",
        "ftet": 0.5143
      },
      {
        "order": 9,
        "name": "ดร.จามิกร หิรัญรัตน์ (OOP)",
        "ftet": 0.5067
      },
      {
        "order": 1,
        "name": "ผศ.ดร.คมสันต์ กาญจนสิทธิ์",
        "ftet": 0.4857
      },
      {
        "order": 11,
        "name": "ดร.ฐิตินันท์ เกลี้ยงสุวรรณ",
        "ftet": 0.4857
      },
      {
        "order": 13,
        "name": "ดร.วศิมน พาณิชพัฒนกุล",
        "ftet": 0.4857
      },
      {
        "order": 14,
        "name": "อ.กุลวรรธน์ เชาวนวาที",
        "ftet": 0.4286
      },
      {
        "order": 3,
        "name": "ผศ.ดร.นพพณ เลิศชูวงศา",
        "ftet": 0.4
      },
      {
        "order": 12,
        "name": "ดร.ยศวีย์ แก้วมณี",
        "ftet": 0.3714
      },
      {
        "order": 2,
        "name": "ผศ.ดร.ณัฐพงศ์ ทองเทพ",
        "ftet": 0.3429
      },
      {
        "order": 17,
        "name": "อ.วิศรุต จันทระ",
        "ftet": 0.3143
      },
      {
        "order": 10,
        "name": "ดร.ฉกาจกิจ แท่นชัยกุล",
        "ftet": 0.1714
      }
    ],
    "t2": [
      {
        "order": 5,
        "name": "ผศ.ดร.ณัฐพงศ์ ทองเทพ",
        "ftet": 0.6571
      },
      {
        "order": 7,
        "name": "ผศ.ดร.นรเทพ รัตนวิภานนท์",
        "ftet": 0.6571
      },
      {
        "order": 9,
        "name": "ผศ.ดร.อดิศักดิ์ อินทนา",
        "ftet": 0.6571
      },
      {
        "order": 1,
        "name": "ผศ.ดร.กฤตศิลป์ ศิลานนท์",
        "ftet": 0.6286
      },
      {
        "order": 12,
        "name": "ดร.ยศวีย์ แก้วมณี",
        "ftet": 0.6
      },
      {
        "order": 2,
        "name": "ผศ.ดร.กุลจรี ตันตยกุล",
        "ftet": 0.5286
      },
      {
        "order": 4,
        "name": "ผศ.ดร.ฐิตินันท์ เกลี้ยงสุวรรณ",
        "ftet": 0.5143
      },
      {
        "order": 10,
        "name": "ดร.จักรพันธ์ สัวบุตร",
        "ftet": 0.4571
      },
      {
        "order": 18,
        "name": "อ.อยุทธย์ อินทรประดิษฐ์",
        "ftet": 0.4571
      },
      {
        "order": 8,
        "name": "ผศ.ดร.วโรดม วีระพันธ์",
        "ftet": 0.4429
      },
      {
        "order": 15,
        "name": "อ.กุลศิริ จิรายุส",
        "ftet": 0.4
      },
      {
        "order": 17,
        "name": "อ.วิศรุต จันทระ*",
        "ftet": 0.3857
      },
      {
        "order": 16,
        "name": "อ.พัชรี เทพนิมิตร*",
        "ftet": 0.2857
      },
      {
        "order": 3,
        "name": "ผศ.ดร.คมสันต์ กาญจนสิทธิ์",
        "ftet": 0.2571
      },
      {
        "order": 13,
        "name": "ดร.วศิมน พาณิชพัฒนกุล",
        "ftet": 0.2571
      },
      {
        "order": 6,
        "name": "ผศ.ดร.นพพณ เลิศชูวงศา",
        "ftet": 0.2286
      },
      {
        "order": 11,
        "name": "ดร.ฉกาจกิจ แท่นชัยกุล",
        "ftet": 0.2286
      },
      {
        "order": 14,
        "name": "อ.กุลวรรธน์ เชาวนวาที",
        "ftet": 0.2286
      }
    ]
  },
  "MsComp": {
    "t1": [
      {
        "order": 7,
        "name": "ผศ.ดร.วีราภรณ์ ซิดดู",
        "ftet": 0.8286
      },
      {
        "order": 2,
        "name": "ผศ.ดร.ขวัญกมล ดิฐกัญจน์",
        "ftet": 0.6857
      },
      {
        "order": 6,
        "name": "ผศ.ดร.วโรดม วีระพันธ์",
        "ftet": 0.6
      },
      {
        "order": 8,
        "name": "ผศ.ดร.อดิศักดิ์ อินทนา*",
        "ftet": 0.579
      },
      {
        "order": 9,
        "name": "ดร.กุลจรี ตันตยกุล",
        "ftet": 0.5714
      },
      {
        "order": 10,
        "name": "ดร.จักรพันธ์ สัวบุตร",
        "ftet": 0.5429
      },
      {
        "order": 3,
        "name": "ผศ.ดร.คมสันต์ กาญจนสิทธิ์",
        "ftet": 0.4857
      },
      {
        "order": 1,
        "name": "รศ.ดร.อซีส นันทอมรพงศ์",
        "ftet": 0.3429
      },
      {
        "order": 4,
        "name": "ผศ.ดร.ณัฐพงศ์ ทองเทพ",
        "ftet": 0.3429
      },
      {
        "order": 5,
        "name": "ผศ.ดร.นรเทพ รัตนวิภานนท์",
        "ftet": 0.0
      }
    ],
    "t2": [
      {
        "order": 3,
        "name": "ผศ.ดร.ขวัญกมล ดิฐกัญจน์",
        "ftet": 0.7429
      },
      {
        "order": 5,
        "name": "ผศ.ดร.ณัฐพงศ์ ทองเทพ",
        "ftet": 0.6571
      },
      {
        "order": 6,
        "name": "ผศ.ดร.นรเทพ รัตนวิภานนท์",
        "ftet": 0.6571
      },
      {
        "order": 9,
        "name": "ผศ.ดร.อดิศักดิ์ อินทนา",
        "ftet": 0.6571
      },
      {
        "order": 2,
        "name": "ผศ.ดร.กุลจรี ตันตยกุล",
        "ftet": 0.5286
      },
      {
        "order": 10,
        "name": "ดร.จักรพันธ์ สัวบุตร",
        "ftet": 0.4571
      },
      {
        "order": 7,
        "name": "ผศ.ดร.วโรดม วีระพันธ์",
        "ftet": 0.4429
      },
      {
        "order": 8,
        "name": "ผศ.ดร.วีราภรณ์ ซิดดู",
        "ftet": 0.3714
      },
      {
        "order": 4,
        "name": "ผศ.ดร.คมสันต์ กาญจนสิทธิ์",
        "ftet": 0.2571
      },
      {
        "order": 1,
        "name": "รศ.ดร.อซีส นันทอมรพงศ์",
        "ftet": 0.2
      }
    ]
  }
};

// Complete Courses per teacher extracted from CoC sheets
const ALL_TEACHER_COURSES: Record<string, any[]> = {
  "รศ.ดร.อซีส นันทอมรพงศ์": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "968-350",
      "course_name": "Project Management and Quality Assurance",
      "credits": "3(3-0-6)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-301",
      "course_name": "Project Management and Quality Assurance",
      "credits": "3(3-0-6)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-364",
      "course_name": "Software Deployment and Maintenance",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "รศ.ดร.อภิชาติ หีดนาคราม": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-340",
      "course_name": "Mathematics for Intelligent Objects",
      "credits": "3(3-0-6)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "102-301",
      "course_name": "Information Searching and Presentation",
      "credits": "3 (2-2-5)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-401",
      "course_name": "Digital Engineering Project II",
      "credits": "3(0-9-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "102-301",
      "course_name": "Information Searching and Presentation",
      "credits": "3(2-2-5)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    }
  ],
  "ผศ.ดร.กาญจนา เหล่าเส็น": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-251",
      "course_name": "Introduction to Artificial Intelligence",
      "credits": "3(2-2-5)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "969-051",
      "course_name": "Change your thoughts, Change your life (midterm)",
      "credits": "2((2)-0-4)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "969-051",
      "course_name": "Change your thoughts, Change your life (midterm)",
      "credits": "2((2)-0-4)",
      "student_groups": "MSCM66 ETM66 Geo66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-240",
      "course_name": "Web Development and Programming",
      "credits": "3(2-2-5)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-353",
      "course_name": "Knowledge Representation and Reasoning",
      "credits": "3(2-2-5)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    }
  ],
  "ผศ.ดร.ขวัญกมล ดิฐกัญจน์": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-151",
      "course_name": "Database Systems",
      "credits": "3(2-2-5)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-151",
      "course_name": "Database Systems",
      "credits": "3(2-2-5)",
      "student_groups": "Comp66, Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0857,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "969-602",
      "course_name": "Explorative Data Analysis and Visualization",
      "credits": "3((3)-0-6)",
      "student_groups": "MSComp67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "969-602",
      "course_name": "Advanced Statistics for Computing",
      "credits": "3((3)-0-6)",
      "student_groups": "MSCompInter1-66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-252",
      "course_name": "Data Science",
      "credits": "3(2-2-5)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 6.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "976-241",
      "course_name": "Database Systems",
      "credits": "3(2-2-5)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "969-622",
      "course_name": "Computer Vision and Image Understanding",
      "credits": "3((3)-0-6)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    }
  ],
  "ผศ.ดร.ขวัญกมล  ดิฐกัญจน์": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-352",
      "course_name": "Introduction to Machine Learning",
      "credits": "3(2-2-5)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-491",
      "course_name": "Project in Computing 2",
      "credits": "3(0-9-0)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 4.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.คมสันต์ กาญจนสิทธิ์": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-342",
      "course_name": "Intelligent Connected Objects",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "SCI-103",
      "course_name": "Physics I",
      "credits": "12 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "SCI-104",
      "course_name": "Physics II",
      "credits": "12 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-801",
      "course_name": "Thesis",
      "credits": "9(0-27-0)",
      "student_groups": "MSCompInter3-65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-603",
      "course_name": "Seminar *",
      "credits": "1(0-2-1)",
      "student_groups": "MSCompInter3-65",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-352",
      "course_name": "Cyber-physical Systems",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "SYS-301",
      "course_name": "Cyber-Physical Systems",
      "credits": "4",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-801",
      "course_name": "Thesis",
      "credits": "9(0-27-0)",
      "student_groups": "MSComputing66",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.ณัฐพงศ์ ทองเทพ": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-152",
      "course_name": "Introduction to Information Technology",
      "credits": "3((3)-0-6)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "976-251",
      "course_name": "Computer Ethics and Laws",
      "credits": "1(1-0-2)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "HCD-301",
      "course_name": "Ethics in Computer Engineering",
      "credits": "2 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "969-061",
      "course_name": "Systematic Solving",
      "credits": "2((2)-0-4)",
      "student_groups": "DE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "969-061",
      "course_name": "Systematic Solving",
      "credits": "2((2)-0-4)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-150",
      "course_name": "Organization and Information System Management",
      "credits": "3((3)-0-6)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-356",
      "course_name": "Introduction to Natural Language Processing",
      "credits": "3(3-0-6)",
      "student_groups": "Comp64-66 (AI)",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "AIC-602",
      "course_name": "Natural Language Processing (NLP)**",
      "credits": "4",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "969-610",
      "course_name": "Text Analytics and Its Applications",
      "credits": "3((3)-0-6)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "969-603",
      "course_name": "Seminar *",
      "credits": "1(0-2-1)",
      "student_groups": "MSComputing66",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "969-801",
      "course_name": "Thesis",
      "credits": "9(0-27-0)",
      "student_groups": "MSComputing66",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.นพพณ เลิศชูวงศา": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-215",
      "course_name": "Electric Circuits and Electronics",
      "credits": "3(2-2-5)",
      "student_groups": "DE65-66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "AIC-501",
      "course_name": "Supervised and Unsupervised Learning",
      "credits": "6 Units",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "AIC-502",
      "course_name": "Reinforcement Learning",
      "credits": "4 Units",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "AIC-503",
      "course_name": "Transformer Network",
      "credits": "4 Units",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-343",
      "course_name": "Image Processing and Computer Vision",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.นรเทพ รัตนวิภานนท์": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-401",
      "course_name": "Digital Engineering Project II",
      "credits": "3(0-9-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-041",
      "course_name": "Choose Wisely Live Well",
      "credits": "2((2)-0-4)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-041",
      "course_name": "Choose Wisely Live Well (FIS)",
      "credits": "2((2)-0-4)",
      "student_groups": "IB66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-041",
      "course_name": "Choose Wisely Live Well (FHT)",
      "credits": "2((2)-0-4)",
      "student_groups": "BIZINNO66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-213",
      "course_name": "Computer Security",
      "credits": "3(2-2-5)",
      "student_groups": "DE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-330",
      "course_name": "Special Topic in Network and Security Engineering I \n(Trusted Computing)",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-603",
      "course_name": "Seminar *",
      "credits": "1(0-2-1)",
      "student_groups": "MSComputing66",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969–801",
      "course_name": "Thesis",
      "credits": "9(0-27-0)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.นวนล ธีระอัมพรพันธุ์": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-121",
      "course_name": "Statistics and Probability",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67, Comp65-66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-141",
      "course_name": "Data Structures and Algorithms",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-141",
      "course_name": "Data Structures and Algorithms",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0857,
      "co_teach": false
    }
  ],
  "ผศ.ดร.นวนล* (ผู้ประสานงาน)": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-491",
      "course_name": "Project in Computing 2",
      "credits": "3(0-9-0)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.ปาณิศา ตรีพงศ์": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-140",
      "course_name": "Introduction to Computer Programming",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67, Comp65-66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-140",
      "course_name": "Introduction to Computer Programming",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67, Comp65-66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-351",
      "course_name": "Business Intelligence",
      "credits": "3(2-2-5)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-491",
      "course_name": "Project in Computing 2",
      "credits": "3(0-9-0)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-253",
      "course_name": "Data Visualization",
      "credits": "3(2-2-5)",
      "student_groups": "Comp64-66 (AI)",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    }
  ],
  "ผศ.ดร.วโรดม วีระพันธ์": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "240-306",
      "course_name": "Wireless and Mobile Networks",
      "credits": "2(2-0-4)",
      "student_groups": "CoE59-61",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "240-311",
      "course_name": "Distributed Computing and Web Technologies",
      "credits": "3 (3-0-6)",
      "student_groups": "CoE59-61",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-110",
      "course_name": "Web Programming",
      "credits": "3(2-2-5)",
      "student_groups": "DE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-401",
      "course_name": "Digital Engineering Project II",
      "credits": "3(0-9-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-802",
      "course_name": "Thesis",
      "credits": "3(0-9-0)",
      "student_groups": "MSComp67",
      "section": 2,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-801",
      "course_name": "Thesis",
      "credits": "9(0-27-0)",
      "student_groups": "MSCompInter3-65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-110",
      "course_name": "Web Programming",
      "credits": "3(2-2-5)",
      "student_groups": "DE65-66 (ตกค้าง)",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 1.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "SYS-103",
      "course_name": "Web Architecture*",
      "credits": "4",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "SYS-104",
      "course_name": "Storage and File Systems Fundamentals*",
      "credits": "2",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969–802",
      "course_name": "Thesis",
      "credits": "3(0-9-0)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.วีราภรณ์ ซิดดู*": [
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-101",
      "course_name": "Principles of Digital Business and Marketing (midterm)",
      "credits": "3((3)-0-6)",
      "student_groups": "DBiz67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "976-381",
      "course_name": "Project in Digital Business 1",
      "credits": "2(0-6-0)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    }
  ],
  "ผศ.ดร.วีราภรณ์ ซิดดู": [
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-587",
      "course_name": "Special Topics in Digital Business III \n(Digital Content Marketing for Business)",
      "credits": "3(3-0-6)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "969-603",
      "course_name": "Digital Project Management",
      "credits": "3((3)-0-6)",
      "student_groups": "MSComp67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-481",
      "course_name": "Project in Digital Business 2",
      "credits": "3(0-9-0)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "969-802",
      "course_name": "Thesis",
      "credits": "3(0-9-0)",
      "student_groups": "MSComp67",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "969-802",
      "course_name": "Thesis",
      "credits": "3(0-9-0)",
      "student_groups": "MSCompInter1-66",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "969-802",
      "course_name": "Thesis",
      "credits": "9(0-27-0)",
      "student_groups": "MSCompInter3-65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "969-603",
      "course_name": "Seminar*",
      "credits": "1(0-2-1)",
      "student_groups": "MSCompInter1-66",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "969-603",
      "course_name": "Seminar *",
      "credits": "1(0-2-1)",
      "student_groups": "MSCompInter3-65",
      "section": 2,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "976-587",
      "course_name": "Special Topics in Electronic Business III  (Digital Marketing Technology)",
      "credits": "3(2-2-5)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "969-042G4",
      "course_name": "Uses of Artificial Intelligence in Daily Life",
      "credits": "2((2)-0-4)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "969-042G4",
      "course_name": "Uses of Artificial Intelligence in Daily Life",
      "credits": "2((2)-0-4)",
      "student_groups": "DBiz67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "969–802",
      "course_name": "Thesis",
      "credits": "3(0-9-0)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "969-802",
      "course_name": "Thesis",
      "credits": "9(0-27-0)",
      "student_groups": "MSComputing66",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.อดิศักดิ์ อินทนา": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-362",
      "course_name": "Software Verification and Validation",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-401",
      "course_name": "Digital Engineering Project II",
      "credits": "3(0-9-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 3.0,
      "weeks": 15,
      "calculated_ftet": 0.0857,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-601",
      "course_name": "Research Methodology in Computing",
      "credits": "3((3)-0-6)",
      "student_groups": "MSComp67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-601",
      "course_name": "Research Methodology in Computing",
      "credits": "3((3)-0-6)",
      "student_groups": "MSCompInter1-66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-211",
      "course_name": "Software Engineering",
      "credits": "3(2-2-5)",
      "student_groups": "DE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "SYS-201",
      "course_name": "Software Engineering Processes",
      "credits": "6",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-632",
      "course_name": "Software Verification and Validation",
      "credits": "3((3)-0-6)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969–802",
      "course_name": "Thesis",
      "credits": "3(0-9-0)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.อดิศักดิ์ อินทนา*": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-051",
      "course_name": "Change your thoughts, Change your life (final)",
      "credits": "2((2)-0-4)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 8,
      "calculated_ftet": 0.061,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-051",
      "course_name": "Change your thoughts, Change your life (final)",
      "credits": "2((2)-0-4)",
      "student_groups": "MSCM66 ETM66 Geo66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-051",
      "course_name": "Change your thoughts, Change your life (final)",
      "credits": "2((2)-0-4)",
      "student_groups": "HPM65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 8,
      "calculated_ftet": 0.061,
      "co_teach": false
    }
  ],
  "ดร.กฤตศิลป์  ศิลานนท์": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-112",
      "course_name": "Database System",
      "credits": "3(2-2-5)",
      "student_groups": "DE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-370",
      "course_name": "Special Topics in Software Engineering I \n(Python Website Development)",
      "credits": "3(2-2-5)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ดร.กฤตศิลป์ ศิลานนท์": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-041G4",
      "course_name": "Global Digital Literacy",
      "credits": "2(2-0-4)",
      "student_groups": "HPM67, BIZINNO67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-041G4",
      "course_name": "Global Digital Literacy",
      "credits": "2(2-0-4)",
      "student_groups": "MSCM67 ETM67 Geo67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    }
  ],
  "ดร.กุลจรี ตันตยกุล": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "001-102",
      "course_name": "The King’s Philosophy and Sustainable Development",
      "credits": "2((2)-0-4)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "001-102",
      "course_name": "The King’s Philosophy and Sustainable Development",
      "credits": "2((2)-0-4)",
      "student_groups": "DE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "001-102",
      "course_name": "The King’s Philosophy and Sustainable Development",
      "credits": "2((2)-0-4)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-052",
      "course_name": "CrOM Thinking: Creative and Open Minded Thinking",
      "credits": "2((2)-0-4)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-052",
      "course_name": "CrOM Thinking: Creative and Open Minded Thinking",
      "credits": "2((2)-0-4)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-401",
      "course_name": "Digital Engineering Project II",
      "credits": "3(0-9-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "AIC-101",
      "course_name": "Algorithmic Thinking",
      "credits": "2 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "AIC-102",
      "course_name": "Intro to Programming",
      "credits": "4 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-104",
      "course_name": "Introduction to Computer Programming",
      "credits": "3(2-2-5)",
      "student_groups": "DE65-66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    }
  ],
  "ดร.จักรพันธ์ เชาว์ปรีชา": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-160",
      "course_name": "UI Design",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-361",
      "course_name": "Digital Design 2",
      "credits": "3(2-2-5)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ดร.จักรพันธ์* (ผู้ประสานงาน)": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-491",
      "course_name": "Project in Computing 2",
      "credits": "3(0-9-0)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    }
  ],
  "ดร.จักรพันธ์ สัวบุตร": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-324",
      "course_name": "Cybersecurity",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-333",
      "course_name": "Hacking and Penetration Security Testing",
      "credits": "3(2-2-5)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-401",
      "course_name": "Digital Engineering Project II",
      "credits": "3(0-9-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-802",
      "course_name": "Thesis",
      "credits": "9(0-27-0)",
      "student_groups": "MSCompInter3-65",
      "section": 2,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-603",
      "course_name": "Seminar *",
      "credits": "1(0-2-1)",
      "student_groups": "MSCompInter3-65",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-217",
      "course_name": "Operating Systems",
      "credits": "2(2-0-4)",
      "student_groups": "DE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "SYS-101",
      "course_name": "Operating Systems Basics",
      "credits": "8",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-668",
      "course_name": "Privacy-enhancing Technologies",
      "credits": "3((3)-0-6)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-802",
      "course_name": "Thesis",
      "credits": "9(0-27-0)",
      "student_groups": "MSComputing66",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ดร.จามิกร หิรัญรัตน์": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "976-273",
      "course_name": "Design Thinking and UI/UX",
      "credits": "3(3-0-6)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "HCD-102",
      "course_name": "User Experience and Interface Design",
      "credits": "4 Units",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "Dbiz",
      "course_code": "977-112",
      "course_name": "Design Thinking and UI/UX",
      "credits": "2((2)-0-4)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Dbiz",
      "course_code": "976-381",
      "course_name": "Project in Digital Business 1",
      "credits": "2(0-6-0)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.5,
      "weeks": 15,
      "calculated_ftet": 0.0429,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Dbiz",
      "course_code": "976-162",
      "course_name": "Technology and Software Programming for Business",
      "credits": "3((2)-2-5)",
      "student_groups": "DBiz67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ดร.จามิกร หิรัญรัตน์*": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "976-242",
      "course_name": "Systems Analysis and Design (midterm)",
      "credits": "3(2-2-5)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 8,
      "calculated_ftet": 0.1067,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-401",
      "course_name": "Digital Engineering Project II",
      "credits": "3(0-9-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ดร.จามิกร หิรัญรัตน์ (OOP)": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-120",
      "course_name": "Computer Programming Module",
      "credits": "9((6)-6-15)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 6.0,
      "lab_hours": 6.0,
      "project_hours": 0.0,
      "weeks": 5,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ดร.จิรวัฒน์ แท่นทอง": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "140-330",
      "course_name": "Computer Networking and Management",
      "credits": "3(2-2-5)",
      "student_groups": "Comp64-65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "977-321",
      "course_name": "Computer Networks and Management",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ดร.ฉกาจกิจ แท่นชัยกุล": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-110",
      "course_name": "Introduction to Digital Engineering",
      "credits": "1((1)-0-2)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-216",
      "course_name": "Computer Architecture",
      "credits": "2(2-0-4)",
      "student_groups": "DE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "SYS-102",
      "course_name": "Basic Computer Architecture",
      "credits": "6 Units",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-323",
      "course_name": "Network Security and Management",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ดร.ฐิตินันท์ เกลี้ยงสุวรรณ": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-310",
      "course_name": "Intelligent Systems",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "HCD-201",
      "course_name": "Accessibility and Universal Design (Online)",
      "credits": "4  Units",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "HAS-104",
      "course_name": "Human Geography",
      "credits": "9 Units",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    }
  ],
  "ดร.ฐิตินันท์ เกลี้ยงสุวรรณ* (ผู้ประสานงาน)": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-092",
      "course_name": "E-Sport",
      "credits": "1((1)-0-2)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    }
  ],
  "ดร.ณัฐยา แช่มธิติกุล": [
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-271",
      "course_name": "Organisational and Consumer Behaviour",
      "credits": "3(3-0-6)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-532",
      "course_name": "Web Design and Management",
      "credits": "3(2-2-5)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-491",
      "course_name": "Seminar 2",
      "credits": "1(0-2-1)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-481",
      "course_name": "Project in Digital Business 2",
      "credits": "3(0-9-0)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "976-273",
      "course_name": "Design Thinking and UI/UX",
      "credits": "3(3-0-6)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "976-577",
      "course_name": "Knowledge Management",
      "credits": "3(3-0-6)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Dbiz",
      "course_code": "976-381",
      "course_name": "Project in Digital Business 1",
      "credits": "2(0-6-0)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ดร.มณีเนตร พวงมณี": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-492",
      "course_name": "Computer Ethics and Laws",
      "credits": "1(0-2-1)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0857,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-390",
      "course_name": "Seminar",
      "credits": "1(0-2-1)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-491",
      "course_name": "Project in Computing 2",
      "credits": "3(0-9-0)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "815-113",
      "course_name": "Information Technology for International Organization (FIS)",
      "credits": "3((3)-0-6)",
      "student_groups": "สาขาวิชานานาชาติศึกษา รหัส 67XXXXX",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-453",
      "course_name": "Cybersecurity",
      "credits": "3(2-2-5)",
      "student_groups": "Comp64-66 (AI)",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-130",
      "course_name": "Operating Systems",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0857,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 3.0,
      "weeks": 15,
      "calculated_ftet": 0.0857,
      "co_teach": false
    }
  ],
  "ดร.ยศวีย์ แก้วมณี": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-354",
      "course_name": "Control of Mobile Robots",
      "credits": "3(2-2-5)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-401",
      "course_name": "Digital Engineering Project II",
      "credits": "3(0-9-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-001",
      "course_name": "Lifelong Learning",
      "credits": "2((2)-0-4)",
      "student_groups": "MSCM65 Geo65 ETM66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-344",
      "course_name": "Robotic and Automation Systems",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "HAS-105",
      "course_name": "Global Histories (Online)",
      "credits": "9",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-002G8",
      "course_name": "Office Tools Usage for Students",
      "credits": "2((2)-0-4)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-002G8",
      "course_name": "Office Tools Usage for Students",
      "credits": "2((2)-0-4)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    }
  ],
  "ดร.วรวิกา วัฒนสุนทร": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-261",
      "course_name": "Digital Design 1",
      "credits": "3(2-2-5)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-360",
      "course_name": "Principles of Creativity and Design",
      "credits": "3(2-2-5)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-262",
      "course_name": "Digital Media 1",
      "credits": "3(2-2-5)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ดร.วศิมน พาณิชพัฒนกุล": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-041",
      "course_name": "Choose Wisely Live Well",
      "credits": "2((2)-0-4)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-120",
      "course_name": "Computer Programming Module",
      "credits": "9((6)-6-15)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 6.0,
      "lab_hours": 6.0,
      "project_hours": 0.0,
      "weeks": 5,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-401",
      "course_name": "Digital Engineering Project II",
      "credits": "3(0-9-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-041",
      "course_name": "Choose Wisely Live Well",
      "credits": "2((2)-0-4)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-041",
      "course_name": "Choose Wisely Live Well (FIS)",
      "credits": "2((2)-0-4)",
      "student_groups": "สาขาวิชานานาชาติศึกษา รหัส 66XXXXX",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-041",
      "course_name": "Choose Wisely Live Well (FIS)",
      "credits": "2((2)-0-4)",
      "student_groups": "HPM65",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-322",
      "course_name": "Cloud Computing and Implementation",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "SYS-302",
      "course_name": "Cloud Computing",
      "credits": "4",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-617",
      "course_name": "Advanced Cloud Computing",
      "credits": "3((3)-0-6)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    }
  ],
  "ดร.อมรรัตน์ ประสิทธิ์ศุภโรจน์": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-354",
      "course_name": "Special Topics in Artificial Intelligence and Data Science 1 (Mobile  Application Development)",
      "credits": "3(2-2-5)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-367",
      "course_name": "Game Programming",
      "credits": "3(2-2-5)",
      "student_groups": "Comp64-65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-367",
      "course_name": "Game Programming",
      "credits": "3(2-2-5)",
      "student_groups": "Comp64-66 (DM)",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-142",
      "course_name": "Object Oriented Programming",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-142",
      "course_name": "Object Oriented Programming",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-142",
      "course_name": "Object Oriented Programming",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 4.5,
      "weeks": 15,
      "calculated_ftet": 0.1286,
      "co_teach": false
    }
  ],
  "อ.กุลวรรธน์ เชาวนวาที": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-120",
      "course_name": "Computer Programming Module",
      "credits": "9((6)-6-15)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 6.0,
      "lab_hours": 6.0,
      "project_hours": 0.0,
      "weeks": 5,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-320",
      "course_name": "Mathematics for Network and Security Engineering",
      "credits": "3(3-0-6)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-092",
      "course_name": "E-Sport",
      "credits": "1((1)-0-2)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-214",
      "course_name": "Internet of Things",
      "credits": "3(2-2-5)",
      "student_groups": "DE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "MCS-301",
      "course_name": "Data Gathering",
      "credits": "9",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "อ.กุลศิริ จิรายุส": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-360",
      "course_name": "Requirement Engineering and Software Modeling",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "976-242",
      "course_name": "Systems Analysis and Design (final)",
      "credits": "3(2-2-5)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "HAS-102",
      "course_name": "Social Phychology (Online)",
      "credits": "9 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-401",
      "course_name": "Digital Engineering Project II",
      "credits": "3(0-9-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-300",
      "course_name": "Seminar",
      "credits": "1(0-2-1)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-363",
      "course_name": "Software Process Improvement and Quality Assurance",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "815-113",
      "course_name": "Information Technology for International Organization (FIS)",
      "credits": "3((3)-0-6)",
      "student_groups": "IB67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    }
  ],
  "อ.พัชรี เทพนิมิตร": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "240-215",
      "course_name": "Computer Engineering Mathematics",
      "credits": "3(3-0-6)",
      "student_groups": "CoE59-61",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "MAT-101",
      "course_name": "Differential Equations and Approximation",
      "credits": "12 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "MAT-102",
      "course_name": "Differential and Integral Calculus",
      "credits": "12 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "MAT-103",
      "course_name": "Calculus in Three Dimensions",
      "credits": "12 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "240-309",
      "course_name": "Microcontroller and Interfacing",
      "credits": "3 (3-0-6)",
      "student_groups": "CoE59-61",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-100",
      "course_name": "Calculus for Engineering",
      "credits": "3((3)-0-6)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-200",
      "course_name": "Calculus",
      "credits": "3(3-0-6)",
      "student_groups": "DE65-66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "240-403",
      "course_name": "Pre-Cooperative Education",
      "credits": "1(1-0-2)",
      "student_groups": "CoE59-61",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "968-490",
      "course_name": "Pre-Cooperative Education",
      "credits": "1(1-0-2)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-400",
      "course_name": "Pre-cooperative Education",
      "credits": "1(0-3-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "976-492",
      "course_name": "Pre-cooperative Education",
      "credits": "1(0-3-0)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "240-404",
      "course_name": "Cooperative Education",
      "credits": "7(0-35-0)",
      "student_groups": "CoE59-61",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "968-493",
      "course_name": "Cooperative Education",
      "credits": "6(0-36-0)",
      "student_groups": "Comp63",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-490",
      "course_name": "Cooperative Education",
      "credits": "6(0-36-0)",
      "student_groups": "DE63",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "240-215",
      "course_name": "COMPUTER ENGINEERING MATHEMATICS",
      "credits": "3(3-0-6)",
      "student_groups": "CoE59-61",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "AIC-103",
      "course_name": "Advanced Imperative Programming",
      "credits": "4",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "240-300",
      "course_name": "PRACTICAL TRAINING",
      "credits": "0(0-40-0)",
      "student_groups": "CoE59-61",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "976-588",
      "course_name": "Internship",
      "credits": "3 (3-0-6)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "240-404",
      "course_name": "COOPERATIVE EDUCATION",
      "credits": "7(0-35-0)",
      "student_groups": "CoE59-61",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    }
  ],
  "อ.มนชนก ทองเทพ": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-120",
      "course_name": "Discrete Mathematics",
      "credits": "3((3)-0-6)",
      "student_groups": "Comp67, Comp65-66",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-250",
      "course_name": "Systems Analysis and Design",
      "credits": "3(2-2-5)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-491",
      "course_name": "Project in Computing 2",
      "credits": "3(0-9-0)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "976-111",
      "course_name": "Business Mathematics",
      "credits": "3((3)-0-6)",
      "student_groups": "DBiz67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "976-211",
      "course_name": "Computer Mathematics",
      "credits": "3(3-0-6)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 5.0,
      "weeks": 15,
      "calculated_ftet": 0.1429,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "969-042G4",
      "course_name": "Uses of Artificial Intelligence in daily life (FTE)",
      "credits": "2((2)-0-4)",
      "student_groups": "ETM67, Geo67, MSCM67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    }
  ],
  "อ.เลอลักษณ์ บุญล้ำ": [
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-103",
      "course_name": "Principles of Enterprise Resource Planning",
      "credits": "3((2)-2-5)",
      "student_groups": "DBiz67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-371",
      "course_name": "Strategic Management and Business Transformation",
      "credits": "3(3-0-6)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-101",
      "course_name": "Principles of Digital Business and Marketing (final)",
      "credits": "3((3)-0-6)",
      "student_groups": "DBiz67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-481",
      "course_name": "Project in Digital Business 2",
      "credits": "3(0-9-0)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "976-571",
      "course_name": "e-Enterprise Management and Operation",
      "credits": "3(3-0-6)",
      "student_groups": "DBiz66",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Dbiz",
      "course_code": "976-495",
      "course_name": "Special Topics in Electronic Business I\n(Concept of Business Process)",
      "credits": "3 (3-0-6)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Dbiz",
      "course_code": "976-495",
      "course_name": "Special Topics in Electronic Business I\n(Concept of Business Process)",
      "credits": "3 (3-0-6)",
      "student_groups": "DBiz67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "Dbiz",
      "course_code": "976-381",
      "course_name": "Project in Digital Business 1",
      "credits": "2(0-6-0)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 5.5,
      "weeks": 15,
      "calculated_ftet": 0.1571,
      "co_teach": false
    }
  ],
  "อ.วิศรุต จันทระ": [
    {
      "term": 1,
      "program": "DE",
      "course_code": "977-341",
      "course_name": "Sensors and Microcontroller Interface",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DE",
      "course_code": "969-051",
      "course_name": "Change your thoughts, Change your life (midterm)",
      "credits": "2((2)-0-4)",
      "student_groups": "HPM65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "240-310",
      "course_name": "ALGORITHMS: DESIGN&ANALYSIS",
      "credits": "3(3-0-6)",
      "student_groups": "CoE59-61",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-111",
      "course_name": "Data Structures and Algorithms",
      "credits": "3(2-2-5)",
      "student_groups": "DE65-66 (ตกค้าง)",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 1.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "AIC-107",
      "course_name": "Algorithms and Data Structures",
      "credits": "8",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    }
  ],
  "อ.อภิชาต วสุธาพิทักษ์": [
    {
      "term": 1,
      "program": "Comp",
      "course_code": "102-301",
      "course_name": "Information Searching And Presentation",
      "credits": "3(2-2-5)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Comp",
      "course_code": "968-258",
      "course_name": "Internet of Things and Applications",
      "credits": "3(2-2-5)",
      "student_groups": "Comp63, Comp64-65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "อ.อยุทธย์ อินทรประดิษฐ์": [
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-104",
      "course_name": "Principles of Economics",
      "credits": "3((3)-0-6)",
      "student_groups": "DBiz67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "HAS-108",
      "course_name": "Economics",
      "credits": "9 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "ENI-101",
      "course_name": "Intellectual Property",
      "credits": "3 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "ENI-102",
      "course_name": "Communication and Marketing",
      "credits": "3 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "ENI-103",
      "course_name": "Business Models and Funding",
      "credits": "3 Units",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "969-042",
      "course_name": "Digital Economy",
      "credits": "2((2)-0-4)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "969-042",
      "course_name": "Digital Economy",
      "credits": "2((2)-0-4)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "969-042",
      "course_name": "Digital Economy (FIS)",
      "credits": "2((2)-0-4)",
      "student_groups": "นักศึกษาสาขาวิชาธุรกิจระหว่างประเทศ:จีน รหัส 66XXXXX",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "969-042",
      "course_name": "Digital Economy (FHT)",
      "credits": "2((2)-0-4)",
      "student_groups": "BIZINNO66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-481",
      "course_name": "Project in Digital Business 2",
      "credits": "3(0-9-0)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 3.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "969-042",
      "course_name": "Digital Economy",
      "credits": "2((2)-0-4)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "969-042",
      "course_name": "Digital Economy (FHT)",
      "credits": "2((2)-0-4)",
      "student_groups": "HPM65",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "969-042",
      "course_name": "Digital Economy (FIS)",
      "credits": "2((2)-0-4)",
      "student_groups": "IS65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "976-381",
      "course_name": "Project in Digital Business 1",
      "credits": "2(0-6-0)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "HAS-107",
      "course_name": "History of Music (Online)",
      "credits": "9",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    }
  ],
  "อ.เอสเธอร์ เสงี่ยมกุล": [
    {
      "term": 1,
      "program": "Dbiz",
      "course_code": "976-361",
      "course_name": "Financial Technology (FINTECH)",
      "credits": "3(2-2-5)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "DBiz",
      "course_code": "976-191",
      "course_name": "Seminar I",
      "credits": "1(0-2-1)",
      "student_groups": "DBiz67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 1,
      "program": "Dbiz",
      "course_code": "976-481",
      "course_name": "Project in Digital Business 2",
      "credits": "3(0-9-0)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "976-261",
      "course_name": "Business Analytics and Visualization",
      "credits": "3((2)-2-5)",
      "student_groups": "DBiz67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "976-373",
      "course_name": "Project Management and Quality Assurance",
      "credits": "3(3-0-6)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DBiz",
      "course_code": "976-381",
      "course_name": "Project in Digital Business 1",
      "credits": "2(0-6-0)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    }
  ],
  "จำนวนเต็มเวลาของอาจารย์ในหลักสูตร (FTES ของอาจารย์ในหลักสูตร.)": [],
  "รศ.ดร.อภิชาต หีดนาคราม": [
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-111",
      "course_name": "Computer Ethics and Laws",
      "credits": "1((1)-0-2)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-101",
      "course_name": "Discrete Mathematics",
      "credits": "2((2)-0-4)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "AIC-202",
      "course_name": "Discrete Mathematics",
      "credits": "12",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    }
  ],
  "ผศ.ดร.กฤตศิลป์ ศิลานนท์": [
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-201",
      "course_name": "Statistics and Probability",
      "credits": "3(2-2-5)",
      "student_groups": "DE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "AIC-201",
      "course_name": "Probability and Statistics",
      "credits": "12",
      "student_groups": "AISE67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-041G4",
      "course_name": "Global Digital Literacy (FIS)",
      "credits": "2((2)-0-4)",
      "student_groups": "IB67/IS67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-041G4",
      "course_name": "Global Digital Literacy (FHT)",
      "credits": "2((2)-0-4)",
      "student_groups": "TRM67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    }
  ],
  "ผศ.ดร.กฤตศิลป์ ศิลานนท์ (Backed-Framework)*": [
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-121",
      "course_name": "Module: Website Design and Development",
      "credits": "9((6)-6-15)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ผศ.ดร.กุลจรี ตันตยกุล": [
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-052",
      "course_name": "CrOM Thinking: Creative and Open Minded Thinking",
      "credits": "2((2)-0-4)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-665",
      "course_name": "Network Simulations",
      "credits": "3((3)-0-6)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 3.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1714,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "SYS-105",
      "course_name": "Networks*",
      "credits": "4",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 1.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969–802",
      "course_name": "Thesis",
      "credits": "3(0-9-0)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 1.0,
      "weeks": 15,
      "calculated_ftet": 0.0286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.จักรพันธ์ เชาว์ปรีชา": [
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-266",
      "course_name": "Character and Set Design",
      "credits": "3(2-2-5)",
      "student_groups": "Comp64-66 (DM)",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-364",
      "course_name": "Special Topics in Digital Media 1 (UX/UI Design)",
      "credits": "3(2-2-5)",
      "student_groups": "Comp64-66 (DM)",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.1286,
      "co_teach": false
    }
  ],
  "ผศ.ดร.จิรวัฒน์ แท่นทอง": [
    {
      "term": 2,
      "program": "Comp",
      "course_code": "140-430",
      "course_name": "Server Systems Administration",
      "credits": "3(2-2-5)",
      "student_groups": "Comp65-66 (AI)",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-230",
      "course_name": "Data Communication and Networking",
      "credits": "3(2-2-5)",
      "student_groups": "Comp66",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "969-021G2A",
      "course_name": "Financial Management",
      "credits": "2(2-0-4)",
      "student_groups": "BIZINNO67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.1143,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "969–685",
      "course_name": "Seminar I *",
      "credits": "1(0-2-1)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    }
  ],
  "ผศ.ดร.ฐิตินันท์ เกลี้ยงสุวรรณ": [
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-350",
      "course_name": "Special Topics in Intelligent Objects I \n(Neural Network and Deep Learning for Computer Vision)",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "AIC-301",
      "course_name": "Logic-based Models",
      "credits": "6",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "AIC-303",
      "course_name": "Planning and Search Strategies",
      "credits": "4",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "AIC-304",
      "course_name": "Neural Networks and Deep Learning and CNN",
      "credits": "4",
      "student_groups": "AISE66",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-092",
      "course_name": "E-Sport",
      "credits": "1(1-0-2)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 1.0,
      "lab_hours": 0.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-092",
      "course_name": "E-Sport",
      "credits": "1(1-0-2)",
      "student_groups": "DBiz65",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "968-352",
      "course_name": "Intoduction to Machine Learning",
      "credits": "3(2-2-5)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "969-620",
      "course_name": "Machine Learning",
      "credits": "3((3)-0-6)",
      "student_groups": "MSComputing67",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": true
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    }
  ],
  "ผศ.ดร.นวนล ธีระอัมพรพันธุ์*": [
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    }
  ],
  "ผศ.ดร.วโรดม วีระพันธ์ (Frontend-Framework)": [
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-121",
      "course_name": "Module: Website Design and Development",
      "credits": "9((6)-6-15)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ผศ.ดร.อดิศักดิ์ อินทนา (Software Engineering)": [
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-121",
      "course_name": "Module: Website Design and Development",
      "credits": "9((6)-6-15)",
      "student_groups": "DE67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ดร.มณีเนตร พวงมณี:": [
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-130",
      "course_name": "Operating Systems",
      "credits": "3((2)-2-5)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    }
  ],
  "ดร.วรวิกา วัฒนสุนทร*": [
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 4.5,
      "weeks": 15,
      "calculated_ftet": 0.1286,
      "co_teach": false
    }
  ],
  "ดร.อภิชาต วสุธาพิทักษ์": [
    {
      "term": 2,
      "program": "Comp",
      "course_code": "102-301",
      "course_name": "Information Searching And Presentation",
      "credits": "3(2-2-5)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "102-301",
      "course_name": "Information Searching And Presentation",
      "credits": "3(2-2-5)",
      "student_groups": "Comp67",
      "section": 1,
      "lecture_hours": 2.0,
      "lab_hours": 2.0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.2,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "Comp",
      "course_code": "968-391",
      "course_name": "Project in Computing 1",
      "credits": "3(0-9-0)",
      "student_groups": "Comp65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.1286,
      "co_teach": false
    }
  ],
  "อ.พัชรี เทพนิมิตร*": [
    {
      "term": 2,
      "program": "DE",
      "course_code": "968-493",
      "course_name": "Cooperative Education",
      "credits": "6(0-36-0)",
      "student_groups": "Comp64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "976-493",
      "course_name": "Cooperative Education",
      "credits": "6(0-36-0)",
      "student_groups": "DBiz64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    },
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-490",
      "course_name": "Cooperative Education",
      "credits": "6(0-36-0)",
      "student_groups": "DE64",
      "section": 1,
      "lecture_hours": 0,
      "lab_hours": 0,
      "project_hours": 0.0,
      "weeks": 15,
      "calculated_ftet": 0.0,
      "co_teach": false
    }
  ],
  "อ.วิศรุต จันทระ*": [
    {
      "term": 2,
      "program": "DE",
      "course_code": "977-302",
      "course_name": "Digital Engineering Project I",
      "credits": "3(0-9-0)",
      "student_groups": "DE65",
      "section": 1,
      "lecture_hours": 0.0,
      "lab_hours": 0.0,
      "project_hours": 2.0,
      "weeks": 15,
      "calculated_ftet": 0.0571,
      "co_teach": false
    }
  ]
};

export const getMockTeachers = (
  programCode: string,
  academicYear: number = 2567,
  term: number | null = null
): ProgramTeachersResponse => {
  const progData = RAW_TEACHERS_DATA[programCode] || RAW_TEACHERS_DATA['Comp'];
  let sourceList: any[] = [];

  if (term === 1) {
    sourceList = progData.t1;
  } else if (term === 2) {
    sourceList = progData.t2;
  } else {
    const map = new Map<string, { order: number; name: string; sum: number; count: number }>();
    progData.t1.forEach((t) => {
      map.set(t.name, { order: t.order, name: t.name, sum: t.ftet, count: 1 });
    });
    progData.t2.forEach((t) => {
      if (map.has(t.name)) {
        const item = map.get(t.name)!;
        item.sum += t.ftet;
        item.count += 1;
      } else {
        map.set(t.name, { order: t.order, name: t.name, sum: t.ftet, count: 1 });
      }
    });

    sourceList = Array.from(map.values()).map((item) => ({
      order: item.order,
      name: item.name,
      ftet: Number((item.sum / item.count).toFixed(4)),
    }));
  }

  const data: TeacherLoad[] = sourceList.map((t, idx) => ({
    teacher_id: `T${String(t.order).padStart(3, '0')}`,
    teacher_name: t.name,
    name_en: null,
    is_primary: idx < sourceList.length - 1,
    ftet: Number(t.ftet.toFixed(4)),
    matched: true,
  }));

  if (programCode === 'Comp' && term === 1) {
    data.push({
      teacher_id: null,
      teacher_name: 'อาจารย์พิเศษ (ภายนอก) สุริยันต์',
      name_en: null,
      is_primary: false,
      ftet: 0.1143,
      matched: false,
      identity_key: 'unmatched:suriyan',
    });
  }

  data.sort((a, b) => b.ftet - a.ftet);

  return {
    program: programCode,
    academic_year: academicYear,
    term,
    aggregation: term !== null ? 'semester total' : 'average across available semesters',
    count: data.length,
    unmatched_teacher_count: data.filter((d) => !d.matched).length,
    data,
  };
};

export const getMockTeacherDetail = (teacherId: string): TeacherDetailResponse => {
  // Find teacher name across programs
  let targetName = 'ผศ.ดร.ขวัญกมล ดิฐกัญจน์';
  for (const prog of Object.values(RAW_TEACHERS_DATA)) {
    for (const t of [...prog.t1, ...prog.t2]) {
      if (`T${String(t.order).padStart(3, '0')}` === teacherId || t.name.includes(teacherId)) {
        targetName = t.name;
        break;
      }
    }
  }

  // Look up their real courses
  let rawCourses = ALL_TEACHER_COURSES[targetName] || [];
  if (rawCourses.length === 0) {
    // Partial search
    for (const [k, v] of Object.entries(ALL_TEACHER_COURSES)) {
      if (k.includes(targetName) || targetName.includes(k)) {
        rawCourses = v;
        targetName = k;
        break;
      }
    }
  }

  // Fallback to sample if none
  if (rawCourses.length === 0) {
    rawCourses = [
      {
        term: 1,
        program: 'CoC',
        course_code: '968-151',
        course_name: 'Special Topics in Computing',
        credits: '3(2-2-5)',
        student_groups: 'Sec 01',
        section: 1,
        lecture_hours: 2,
        lab_hours: 2,
        project_hours: 0,
        weeks: 15,
        calculated_ftet: 0.20,
        co_teach: false,
      },
      {
        term: 1,
        program: 'CoC',
        course_code: '968-491',
        course_name: 'Project in Computing',
        credits: '3(0-9-0)',
        student_groups: '2 กลุ่ม',
        section: 1,
        lecture_hours: 0,
        lab_hours: 0,
        project_hours: 2,
        weeks: 15,
        calculated_ftet: 0.0571,
        co_teach: false,
      },
    ];
  }

  const courses: TeacherCourse[] = rawCourses.map((c) => ({
    academic_year: 2567,
    term: c.term || 1,
    program: c.program || 'CoC',
    teacher_name: targetName,
    course_code: c.course_code || '-',
    course_name: c.course_name || '-',
    credits: c.credits || '-',
    student_groups: c.student_groups || '',
    section: c.section || 1,
    lecture_hours: c.lecture_hours || 0,
    lab_hours: c.lab_hours || 0,
    project_hours: c.project_hours || 0,
    weeks: c.weeks || 15,
    calculated_ftet: c.calculated_ftet || 0,
    source_ftet: c.calculated_ftet || 0,
    co_teach: c.co_teach || false,
  }));

  // Build history across past 4 semesters
  const term1Total = courses.filter((c) => c.term === 1).reduce((sum, c) => sum + c.calculated_ftet, 0);
  const term2Total = courses.filter((c) => c.term === 2).reduce((sum, c) => sum + c.calculated_ftet, 0) || (term1Total * 0.95);

  const history = [
    { academic_year: 2564, term: 1, program: 'CoC', ftet: Number((term1Total * 0.92).toFixed(4)) },
    { academic_year: 2564, term: 2, program: 'CoC', ftet: Number((term2Total * 0.90).toFixed(4)) },
    { academic_year: 2565, term: 1, program: 'CoC', ftet: Number((term1Total * 0.96).toFixed(4)) },
    { academic_year: 2565, term: 2, program: 'CoC', ftet: Number((term2Total * 0.94).toFixed(4)) },
    { academic_year: 2566, term: 1, program: 'CoC', ftet: Number((term1Total * 0.98).toFixed(4)) },
    { academic_year: 2566, term: 2, program: 'CoC', ftet: Number((term2Total * 0.96).toFixed(4)) },
    { academic_year: 2567, term: 1, program: 'CoC', ftet: Number(term1Total.toFixed(4)) },
    { academic_year: 2567, term: 2, program: 'CoC', ftet: Number(term2Total.toFixed(4)) },
  ];

  return {
    teacher: {
      teacher_id: teacherId,
      name_th: targetName,
      name_en: null,
    },
    history,
    courses,
  };
};

export const mockMethodology: MethodologyResponse = {
  source_tab: 'วิธีการคำนวณ',
  formula: '((ชั่วโมงบรรยาย × 2.0 + ชั่วโมงปฏิบัติการ × 1.5 + โครงงาน) × section × weeks) ÷ 525',
  config: {
    hours_per_ftet: 525.0,
    weeks_per_semester: 15,
    lecture_multiplier: 2.0,
    lab_multiplier: 1.5,
    coc_programs: ['Comp', 'DE', 'DBiz', 'MsComp'],
  },
  example: {
    course: 'Database Systems (968-151)',
    credits: '3(2-2-5)',
    section: 1,
    lecture_hours: 2,
    lab_hours: 2,
    project_hours: 0,
    weeks: 15,
    calculated_ftet: 0.20,
    teacher_name_th: 'ผศ.ดร.ขวัญกมล ดิฐกัญจน์',
    academic_year: 2567,
    term: 1,
    teacher_total_example: 0.6857,
    teacher_total_note: 'รวมทุกรายวิชาที่สอนในภาคการศึกษาที่ 1/2567 ได้ 0.6857 FTET',
  },
  source_notes: [
    'FTET หมายถึง จำนวนอาจารย์ที่มีชั่วโมงการสอนต่อภาคการศึกษา เท่ากับ 525 ชั่วโมง คิดเป็น 1 FTET',
    'ที่มาของ 525 ชม.: 1 วันทำงาน 7 ชม. = 1 สัปดาห์ทำงาน 35 ชม. (7x5) ดังนั้น 1 ภาคการศึกษา 15 สัปดาห์ = 35 x 15 = 525 ชั่วโมง',
    'วิธีที่ 3 ปรับจำนวนชั่วโมงวิชาโครงงานและชั่วโมงเตรียมสอน:',
    '- ชั่วโมงบรรยาย 1 ชม. สอนจริง คิดเวลาเตรียมสอน 1 ชม. (ตัวคูณ 2.0)',
    '- ชั่วโมงปฏิบัติการ 1 ชม. คุม Lab คิดเป็น 1.5 ชม. ทำงาน (ตัวคูณ 1.5)',
    '- วิชาโครงงาน: โครงงานเดี่ยว/กลุ่ม คิดโครงงานละ 1 ชม./สัปดาห์ (ตัวคูณ 1.0)',
    '- วิชาสัมมนา / กิจกรรมเสริมหลักสูตร: ชั่วโมงปฏิบัติการ x 1.5',
    'วิชาเรียนร่วมกำหนด FTET เป็น 0 ในแถวซ้ำเพื่อไม่ให้นับซ้ำซ้อน',
    'หลักสูตร AISE แสดงแยกจากผลรวม CoC ตามข้อตกลงเกณฑ์การประเมิน',
  ],
};

export const mockDataQuality: DataQualityResponse = {
  count: 6,
  counts_by_type: {
    unmatched_teacher: 2,
    missing_hours: 2,
    co_teach_zero: 1,
    special_course: 1,
  },
  data: [
    {
      type: 'unmatched_teacher',
      severity: 'medium',
      message: 'ชื่ออาจารย์ "อาจารย์พิเศษ (ภายนอก) สุริยันต์" ไม่พบในฐานข้อมูล Teacher Roster',
      source_tab: 'FTET_1-2567 Comp',
      source_row: 24,
      academic_year: 2567,
      term: 1,
      program: 'Comp',
      teacher_name_raw: 'อาจารย์พิเศษ (ภายนอก) สุริยันต์',
      course_code: '968-281',
    },
    {
      type: 'missing_hours',
      severity: 'high',
      message: 'รายวิชา AISE ระบุหน่วยกิตแบบโมดูล "12 Units" (SCI-103, SCI-104) อาศัยการระบุชั่วโมงแยกในช่อง B/C',
      source_tab: 'FTET_1-2567-AISE',
      source_row: 18,
      academic_year: 2567,
      term: 1,
      program: 'AISE',
      teacher_name: 'ผศ.ดร.คมสันต์ กาญจนสิทธิ์',
      course_code: 'SCI-104',
    },
    {
      type: 'co_teach_zero',
      severity: 'low',
      message: 'วิชาเรียนร่วม 969-602 (MSCompInter1-66) กำหนด FTET เป็น 0 ตามกติกาเพื่อไม่ให้นับซ้ำกับกลุ่ม MSComp67',
      source_tab: 'FTET_1-2567 Comp',
      source_row: 18,
      academic_year: 2567,
      term: 1,
      program: 'Comp',
      course_code: '969-602',
      source_ftet: 0.0,
      calculated_ftet: 0.0,
    },
    {
      type: 'unmatched_teacher',
      severity: 'medium',
      message: 'ชื่ออาจารย์มีสัญลักษณ์กำกับ "ผศ.ดร.นวนล* (ผู้ประสานงาน)" ต้องตัดดอกจันและคำว่าผู้ประสานงานออกเพื่อจับคู่',
      source_tab: 'FTET_1-2567 Comp',
      source_row: 25,
      academic_year: 2567,
      term: 1,
      program: 'Comp',
      teacher_name_raw: 'ผศ.ดร.นวนล* (ผู้ประสานงาน)',
      course_code: '968-491',
    },
    {
      type: 'special_course',
      severity: 'low',
      message: 'รายวิชาโมดูล DE67 "977-120 Computer Programming Module (9 Units)" แบ่งสอน 3 คน คนละ 5 สัปดาห์',
      source_tab: 'FTET_1-2567-DE',
      source_row: 35,
      academic_year: 2567,
      term: 1,
      program: 'DE',
      course_code: '977-120',
    },
    {
      type: 'missing_hours',
      severity: 'medium',
      message: 'วิชาโครงงาน 977-401 (ดร.นรเทพ) เป็นภาระงานประสานงานรายวิชา กำหนด FTET = 0 ในชีต',
      source_tab: 'FTET_1-2567-DE',
      source_row: 20,
      academic_year: 2567,
      term: 1,
      program: 'DE',
      course_code: '977-401',
    },
  ],
};
