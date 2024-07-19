// import { useState } from 'react';
// import { useMount } from 'react-use';
//
// import { FIELD_TYPE_KEY } from '../../core/constants';
// import { FieldEnhancements } from '../../core/index.core';
// import { QuestionnaireService } from '../../core/services/core.service';
// import { snakeCase } from '../../utils';
//
// // interface EnterValidation {
// //   name: string;
// //   on: string;
// //   validations?: string[];
// // }
//
// interface Validation {
//   name: string;
//   on: 'change' | 'focus' | 'blur' | 'enter';
//   validator: (value: any) => boolean;
//   errorMessage: string;
// }
//
// interface FieldHanders {
//   value: string;
//   type: string;
//   onChange: (value: string) => void;
//   onBlur: () => void;
//   onFocus: () => void;
//   onEnter: (callback?: () => void) => void;
//   error: string | null;
//   valid: boolean;
// }
//
// interface Props {
//   __enhancements?: FieldEnhancements;
//   validations: Validation[];
//   name: string;
//   type: string;
//   children: (props: FieldHanders) => JSX.Element;
// }
//
// export const Field = ({
//   children,
//   name,
//   type,
//   validations = [],
//   __enhancements,
// }: Props) => {
//   const [value, setValue] = useState('');
//   const [valid, setValid] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//
//   const snakedName = snakeCase(name);
//   const { step, setProcessed, setValidStep } = __enhancements;
//
//   useMount(() => {
//     // Register the field on the Questionnaire Service
//     QuestionnaireService.setField(snakedName, step);
//     // Retrieve the value in case there's already a value stored for this field
//     const serviceValue = QuestionnaireService.getFieldValue(snakedName, step);
//     setValue(serviceValue);
//   });
//
//   const onChange = (value: string) => {
//     setValue(value);
//     QuestionnaireService.setFieldValue(snakedName, step, value);
//
//     if (validations.length === 0) {
//       setProcessed(true);
//       return;
//     }
//
//     const onChangeValidations = validations.filter(
//       (validation) => validation.on === 'change',
//     );
//
//     if (onChangeValidations.length === 0) {
//       setProcessed(true);
//       return;
//     }
//
//     const amountOfOnChangeValidations = onChangeValidations.length;
//
//     let errored = false;
//
//     for (let i = 0; i < amountOfOnChangeValidations && !errored; i++) {
//       const validationOk = onChangeValidations[i]?.validator(value);
//       const validation = onChangeValidations[i] as Validation;
//
//       if (!validationOk) {
//         setError(validation.errorMessage);
//         errored = true;
//       }
//
//       setValidStep(validationOk);
//       setValid(validationOk);
//     }
//   };
//
//   const onFocus = () => {
//     if (validations.length === 0) {
//       setProcessed(true);
//       return;
//     }
//
//     const onFocusValidations = validations.filter(
//       (validation) => validation.on === 'focus',
//     );
//
//     if (onFocusValidations.length === 0) {
//       setProcessed(true);
//       return;
//     }
//
//     const amountOfOnFocusValidations = onFocusValidations.length;
//
//     let errored = false;
//
//     for (let i = 0; i < amountOfOnFocusValidations && !errored; i++) {
//       const validationOk = onFocusValidations[i]?.validator(value);
//       const validation = onFocusValidations[i] as Validation;
//
//       if (!validationOk) {
//         setError(validation.errorMessage);
//         errored = true;
//       }
//
//       setValidStep(validationOk);
//       setValid(validationOk);
//     }
//   };
//
//   const onBlur = () => {
//     if (validations.length === 0) {
//       setProcessed(true);
//       return;
//     }
//
//     const onBlurValidations = validations.filter(
//       (validation) => validation.on === 'blur',
//     );
//
//     if (onBlurValidations.length === 0) {
//       setProcessed(true);
//       return;
//     }
//
//     const amountOfOnBlurValidations = onBlurValidations.length;
//
//     let errored = false;
//
//     for (let i = 0; i < amountOfOnBlurValidations && !errored; i++) {
//       const validationOk = onBlurValidations[i]?.validator(value);
//       const validation = onBlurValidations[i] as Validation;
//
//       if (!validationOk) {
//         setError(validation.errorMessage);
//         errored = true;
//       }
//
//       setValidStep(validationOk);
//       setValid(validationOk);
//     }
//   };
//
//   const onEnter = (callback?: () => void) => {
//     if (validations.length === 0) {
//       setProcessed(true);
//       return;
//     }
//
//     const onEnterValidations = validations.filter(
//       (validation) => validation.on === 'enter',
//     );
//
//     if (onEnterValidations.length === 0) {
//       setProcessed(true);
//       return;
//     }
//
//     const amountOfOnEnterValidations = onEnterValidations.length;
//
//     let errored = false;
//
//     for (let i = 0; i < amountOfOnEnterValidations && !errored; i++) {
//       const validationOk = onEnterValidations[i]?.validator(value);
//       const validation = onEnterValidations[i] as Validation;
//
//       if (!validationOk) {
//         setError(validation.errorMessage);
//         errored = true;
//       }
//
//       setValidStep(validationOk);
//       setValid(validationOk);
//     }
//
//     if (valid && callback) {
//       callback();
//     }
//
//   return children({
//     value,
//     type,
//     onChange,
//     onBlur,
//     onFocus,
//     onEnter,
//     error,
//     valid,
//   });
// };
//
// Field.__type = FIELD_TYPE_KEY;
