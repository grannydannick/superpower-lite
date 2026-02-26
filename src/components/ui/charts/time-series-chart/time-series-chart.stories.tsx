import { Meta } from '@storybook/react';
import React from 'react';

import { Biomarker } from '@/types/api';

import { TimeSeriesChart } from './time-series-chart';

export default {
  title: 'superpower/time-series-chart',
  component: TimeSeriesChart,
} as Meta;

const biomarker: Biomarker = {
  id: '960121e2-1ffe-4a3c-a865-acf4fdbc1e41',
  name: 'Basophils',
  description:
    "Basophils are a type of white blood cell that the bone marrow makes. They are part of the granulocyte family, along with neutrophils and eosinophils. Granulocytes contain granules that release important substances that influence the behavior of other cells and other biologic substances. Basophils circulate in the blood and migrate to tissues where they encounter foreign substances or signals of inflammation. Basophils release their granules, which contain histamine, heparin, serotonin, and other molecules that play a role in inflammation and allergic reactions.\n\nThere are no normal ranges for this measurement of the %'s, so do not be alarmed by the n/a or missing range.",
  importance:
    "Basophils are important because they reflect your immune system's response to invaders, such as bacteria, viruses, parasites, and fungi, as well as allergens, such as pollen, dust mites, or animal dander. Basophils can also modulate the activity of other immune cells, such as mast cells, T cells, and B cells. Basophils can help protect you from infections and parasites, but they can also cause symptoms of allergies and asthma .",
  category: 'Blood and Oxygen',
  unit: '%',
  status: 'OPTIMAL',
  favorite: false,
  value: [
    {
      id: '1',
      quantity: {
        value: 1,
        comparator: 'EQUALS',
        unit: '%',
      },
      timestamp: '2024-04-26T15:45:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: {
        value: 1,
        comparator: 'EQUALS',
        unit: '%',
      },
      timestamp: '2024-02-20T15:00:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: {
        value: 1,
        comparator: 'EQUALS',
        unit: '%',
      },
      timestamp: '2024-01-25T21:41:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '4',
      quantity: {
        value: 1,
        comparator: 'EQUALS',
        unit: '%',
      },
      timestamp: '2024-01-19T14:00:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '5',
      quantity: {
        value: 0,
        comparator: 'EQUALS',
        unit: undefined,
      },
      timestamp: '2023-10-13T03:02:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '6',
      quantity: {
        value: 1,
        comparator: 'EQUALS',
        unit: undefined,
      },
      timestamp: '2023-01-31T00:00:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
  ],
  metadata: {
    content: [
      {
        title:
          'What can I do nutritionally to increase a low out of range level?',
        text: 'Some nutritional factors that may help increase a low basophil level are consuming more foods rich in vitamin B12, such as meat, poultry, fish, eggs, dairy, and fortified cereals, as vitamin B12 is essential for the production of white blood cells; eating more foods that contain vitamin C, such as citrus fruits, berries, peppers, broccoli, and kiwi, as vitamin C can boost your immune system and prevent infections; and increasing your intake of omega-3 fatty acids, such as fish oil, flaxseed oil, walnuts, and chia seeds, as omega-3s can reduce inflammation and modulate immune responses .',
        status: 'LOW',
      },
      {
        title: 'Why is an optimal level important?',
        text: "Optimal levels of basophils are important because they ensure a balanced immune response. Too few basophils can impair the body's ability to respond to infections and allergens, while too many can indicate an underlying health issue such as chronic inflammation or an autoimmune disease[1][3].",
        status: 'OPTIMAL',
      },
      {
        title: 'What does my low out of range level mean?',
        text: "Low levels of basophils, known as basopenia, can occur due to acute infections, severe allergies, or an overactive thyroid gland. The most common benign cause of low basophil levels is an allergic reaction, where basophils release their histamine. Less common but more serious causes include hyperthyroidism, which can speed up the body's functions[3][9][17].",
        status: 'LOW',
      },
      {
        title:
          'What can I do with my lifestyle to increase a low out of range level?',
        text: 'To increase low basophil levels through lifestyle changes, it is important to maintain overall immune health. This can include managing stress, getting adequate sleep, and avoiding exposure to toxins such as cigarette smoke[7][13].',
        status: 'LOW',
      },
      {
        title:
          'What supplements can I take to increase a low out of range level?',
        text: 'Some supplements that may help increase a low basophil level are probiotics, which are beneficial bacteria that can improve gut health and immune function; quercetin, which is a plant flavonoid that can stabilize mast cells and basophils and prevent histamine release; and vitamin D, which is a hormone that can regulate immune system activity and prevent infections . However, you should always consult your doctor before taking any new supplements.',
        status: 'LOW',
      },
      {
        title: 'What does my high out of range level mean?',
        text: 'High levels of basophils, known as basophilia, can indicate chronic inflammation, autoimmune diseases, allergies, or blood disorders. The most common benign causes include allergic reactions and inflammation due to infection. More serious causes can include chronic myelogenous leukemia and other myeloproliferative disorders[1][3][12].',
        status: 'HIGH',
      },
      {
        title: 'What can I do with my lifestyle to lower a high level?',
        text: 'To decrease high basophil levels through lifestyle changes, it is important to identify and manage any underlying conditions that may be causing inflammation or allergic reactions. Avoiding known allergens and reducing exposure to environmental toxins can be beneficial[7].',
        status: 'HIGH',
      },
      {
        title: 'What supplements can I take to decrease a high level?',
        text: 'Supplements that may help decrease high basophil levels include those with anti-inflammatory properties, such as omega-3 fatty acids and antioxidants like vitamin E[4].',
        status: 'HIGH',
      },
      {
        title: 'What can I do nutritionally to lower a high level?',
        text: 'Nutritionally, following an anti-inflammatory diet, such as the Mediterranean diet, which is rich in antioxidants, omega-3 fatty acids, and other anti-inflammatory foods, may help lower high basophil levels[4].',
        status: 'HIGH',
      },
    ],
    source: [
      {
        text: 'What to know about basophils and their function',
        url: 'https://www.medicalnewstoday.com/articles/324188',
      },
      {
        text: 'What Are Basophils?',
        url: 'https://www.webmd.com/a-to-z-guides/what-are-basophils',
      },
      {
        text: 'Basophilia: Symptoms, Causes, Diagnosis, Treatment',
        url: 'https://www.healthline.com/health/basophilia',
      },
      {
        text: 'Basophils',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8227102/',
      },
      {
        text: 'Basophils: What It Means If the Count Is High or Low - Health',
        url: 'https://www.health.com/basophils-7095524',
      },
      {
        text: 'Basophils',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4751725/',
      },
      {
        text: 'Basophils: Definition and Functions',
        url: 'https://www.health.com/basophils-7095524',
      },
      {
        text: 'Eating Well When Unwell: White Blood Count Diet',
        url: 'https://www.oncologynutrition.org/erfc/eating-well-when-unwell/white-blood-count-diet',
      },
      {
        text: 'Basophils',
        url: 'https://my.clevelandclinic.org/health/body/23256-basophils',
      },
      {
        text: 'Basophils',
        url: 'https://sightdx.com/en-us/knowledge-center/basophils',
      },
      {
        text: 'Basophils',
        url: 'https://sunnybrook.ca/content/?page=handouts-low-blood-cell-count',
      },
      {
        text: 'Basophils',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5893214/',
      },
      {
        text: 'What Is the Function of Basophils?',
        url: 'https://www.medicinenet.com/what_is_the_function_of_basophils/article.htm',
      },
      {
        text: 'Leukopenia Foods: What to Eat with a Low White Blood Cell Count',
        url: 'https://www.nebraskamed.com/cancer/leukopenia-foods-what-to-eat-with-a-low-white-blood-cell-count',
      },
      {
        text: 'Basophil - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Basophil',
      },
      {
        text: 'Basophilia',
        url: 'https://my.clevelandclinic.org/health/diseases/22099-basophilia',
      },
      {
        text: 'Basophils',
        url: 'https://www.sciencedirect.com/topics/agricultural-and-biological-sciences/basophils',
      },
      {
        text: 'Basophils: Definition and Function',
        url: 'https://www.healthline.com/health/basophils',
      },
      {
        text: 'Basophils: Definition & Function',
        url: 'https://study.com/academy/lesson/basophils-definition-function.html',
      },
    ],
  },
  recommendedTests: {
    rx: [],
    services: [],
  },
  ranges: {
    quest: [
      {
        status: 'OPTIMAL',
        low: {
          value: 0,
        },
        high: {
          value: 2,
        },
      },
    ],
    custom: [],
    labcorp: [
      {
        status: 'OPTIMAL',
        low: {
          value: 0,
        },
        high: {
          value: 2,
        },
      },
    ],
    bioref: [
      {
        status: 'OPTIMAL',
        low: {
          value: 0,
        },
        high: {
          value: 2,
        },
      },
    ],
  },
};

export const TimeSeriesChartComponent = () => {
  return (
    <>
      <TimeSeriesChart biomarker={biomarker} height={512} />
    </>
  );
};

const singleValueBiomarker: Biomarker = {
  id: '960121e2-1ffe-4a3c-a865-acf4fdbc1e41',
  name: 'Hemoglobin A1c',
  description:
    'Hemoglobin A1c (HbA1c) is a blood test that measures your average blood sugar levels over the past 2-3 months. It shows how well your diabetes is being controlled.',
  importance:
    'HbA1c is important for monitoring diabetes management and assessing the risk of diabetes-related complications. It provides a longer-term view of blood sugar control compared to daily glucose measurements.',
  category: 'Metabolic Health',
  unit: '%',
  status: 'OPTIMAL',
  favorite: false,
  recommendedTests: {
    rx: [],
    services: [],
  },
  value: [
    {
      id: '1',
      quantity: {
        value: 5.2,
        comparator: 'EQUALS',
        unit: '%',
      },
      timestamp: '2024-04-26T15:45:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
  ],
  metadata: {
    content: [
      {
        title: 'Why is an optimal level important?',
        text: 'Optimal HbA1c levels indicate good blood sugar control, which reduces the risk of diabetes complications such as heart disease, kidney damage, and nerve damage.',
        status: 'OPTIMAL',
      },
    ],
    source: [
      {
        text: 'Understanding A1C Test',
        url: 'https://www.diabetes.org/a1c',
      },
    ],
  },
  ranges: {
    custom: [],
    quest: [
      {
        status: 'OPTIMAL',
        low: {
          value: 4.0,
        },
        high: {
          value: 5.6,
        },
      },
    ],
    labcorp: [
      {
        status: 'OPTIMAL',
        low: {
          value: 4.0,
        },
        high: {
          value: 5.6,
        },
      },
    ],
    bioref: [
      {
        status: 'OPTIMAL',
        low: {
          value: 4.0,
        },
        high: {
          value: 5.6,
        },
      },
    ],
  },
};

export const SingleValueTimeSeriesChart = () => {
  return (
    <>
      <TimeSeriesChart biomarker={singleValueBiomarker} height={512} />
    </>
  );
};

const extremeBoundaryBiomarker: Biomarker = {
  id: '960121e2-1ffe-4a3c-a865-acf4fdbc1e42',
  name: 'Cholesterol Total',
  description:
    'Total cholesterol is a measure of all the cholesterol in your blood, including both good (HDL) and bad (LDL) cholesterol. It is an important indicator of cardiovascular health.',
  importance:
    'Total cholesterol levels help assess your risk of heart disease and stroke. Maintaining optimal levels through diet and lifestyle is crucial for cardiovascular health.',
  category: 'Cardiovascular Health',
  unit: 'mg/dL',
  status: 'HIGH',
  favorite: false,
  recommendedTests: {
    rx: [],
    services: [],
  },
  value: [
    {
      id: '1',
      quantity: {
        value: 200,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2024-04-26T15:45:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: {
        value: 240,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2024-03-15T14:30:00.000Z',
      status: 'HIGH',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: {
        value: 150,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2024-02-10T10:00:00.000Z',
      status: 'LOW',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '4',
      quantity: {
        value: 199,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2024-01-20T09:15:00.000Z',
      status: 'LOW',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '5',
      quantity: {
        value: 240,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2023-12-15T16:45:00.000Z',
      status: 'HIGH',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '6',
      quantity: {
        value: 200,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2023-11-10T11:30:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '7',
      quantity: {
        value: 150,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2023-10-05T08:00:00.000Z',
      status: 'LOW',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '8',
      quantity: {
        value: 199,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2023-09-01T12:00:00.000Z',
      status: 'LOW',
      source: 'quest',
      component: [],
      orderIds: [],
    },
  ],
  metadata: {
    content: [
      {
        title: 'Why is an optimal level important?',
        text: 'Optimal cholesterol levels reduce the risk of heart disease, stroke, and other cardiovascular complications. Maintaining levels within the optimal range supports overall heart health.',
        status: 'OPTIMAL',
      },
      {
        title: 'What does my high level mean?',
        text: 'High cholesterol levels increase the risk of plaque buildup in arteries, which can lead to heart disease and stroke. Lifestyle changes and medication may be needed.',
        status: 'HIGH',
      },
      {
        title: 'What does my low level mean?',
        text: 'Very low cholesterol levels can sometimes indicate malnutrition, liver disease, or other health issues, though this is less common than high cholesterol.',
        status: 'LOW',
      },
    ],
    source: [
      {
        text: 'Understanding Cholesterol Numbers',
        url: 'https://www.heart.org/en/health-topics/cholesterol',
      },
    ],
  },
  ranges: {
    custom: [],
    quest: [
      {
        status: 'LOW',
        low: {
          value: 0,
        },
        high: {
          value: 149,
        },
      },
      {
        status: 'NORMAL',
        low: {
          value: 150,
        },
        high: {
          value: 199,
        },
      },
      {
        status: 'OPTIMAL',
        low: {
          value: 200,
        },
        high: {
          value: 239,
        },
      },
      {
        status: 'HIGH',
        low: {
          value: 240,
        },
        high: {
          value: 500,
        },
      },
    ],
    labcorp: [
      {
        status: 'LOW',
        low: {
          value: 0,
        },
        high: {
          value: 149,
        },
      },
      {
        status: 'NORMAL',
        low: {
          value: 150,
        },
        high: {
          value: 199,
        },
      },
      {
        status: 'OPTIMAL',
        low: {
          value: 200,
        },
        high: {
          value: 239,
        },
      },
      {
        status: 'HIGH',
        low: {
          value: 240,
        },
        high: {
          value: 500,
        },
      },
    ],
    bioref: [
      {
        status: 'LOW',
        low: {
          value: 0,
        },
        high: {
          value: 149,
        },
      },
      {
        status: 'NORMAL',
        low: {
          value: 150,
        },
        high: {
          value: 199,
        },
      },
      {
        status: 'OPTIMAL',
        low: {
          value: 200,
        },
        high: {
          value: 239,
        },
      },
      {
        status: 'HIGH',
        low: {
          value: 240,
        },
        high: {
          value: 500,
        },
      },
    ],
  },
};

export const ExtremeBoundaryTimeSeriesChart = () => {
  return (
    <>
      <TimeSeriesChart biomarker={extremeBoundaryBiomarker} height={512} />
    </>
  );
};

const extremeDateClusteringBiomarker: Biomarker = {
  id: '960121e2-1ffe-4a3c-a865-acf4fdbc1e43',
  name: 'Blood Glucose',
  description:
    'Blood glucose levels measured throughout the day. Multiple readings on the same date can occur during glucose monitoring protocols.',
  importance:
    'Frequent glucose monitoring helps track blood sugar patterns and responses to meals, exercise, and medications.',
  category: 'Metabolic Health',
  unit: 'mg/dL',
  status: 'OPTIMAL',
  favorite: false,
  recommendedTests: {
    rx: [],
    services: [],
  },
  value: [
    {
      id: '1',
      quantity: {
        value: 95,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2024-04-26T08:00:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '2',
      quantity: {
        value: 120,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2024-04-26T12:30:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '3',
      quantity: {
        value: 105,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2024-04-26T18:45:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '4',
      quantity: {
        value: 88,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2024-10-26T09:15:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
    {
      id: '5',
      quantity: {
        value: 115,
        comparator: 'EQUALS',
        unit: 'mg/dL',
      },
      timestamp: '2024-10-26T15:30:00.000Z',
      status: 'OPTIMAL',
      source: 'quest',
      component: [],
      orderIds: [],
    },
  ],
  metadata: {
    content: [
      {
        title: 'Why is an optimal level important?',
        text: 'Optimal blood glucose levels indicate good metabolic health and reduce the risk of diabetes complications.',
        status: 'OPTIMAL',
      },
    ],
    source: [
      {
        text: 'Blood Glucose Monitoring',
        url: 'https://www.diabetes.org/healthy-living/medication-treatments/blood-glucose-testing-and-control',
      },
    ],
  },
  ranges: {
    custom: [],
    quest: [
      {
        status: 'OPTIMAL',
        low: {
          value: 70,
        },
        high: {
          value: 140,
        },
      },
    ],
    labcorp: [
      {
        status: 'OPTIMAL',
        low: {
          value: 70,
        },
        high: {
          value: 140,
        },
      },
    ],
    bioref: [
      {
        status: 'OPTIMAL',
        low: {
          value: 70,
        },
        high: {
          value: 140,
        },
      },
    ],
  },
};

export const ExtremeDateClusteringTimeSeriesChart = () => {
  return (
    <>
      <TimeSeriesChart
        biomarker={extremeDateClusteringBiomarker}
        height={512}
      />
    </>
  );
};
