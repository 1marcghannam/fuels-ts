import { getNewAbiTypegen } from '../../test/utils/getNewAbiTypegen';
import { CategoryEnum } from '../interfaces/CategoryEnum';
import * as renderCommonTemplateMod from '../templates/common/common';
import * as renderFactoryTemplateMod from '../templates/script/factory';
import * as renderIndexTemplateMod from '../templates/script/index';

import { assembleScripts } from './assembleScripts';

describe('assembleScripts.ts', () => {
  function mockAllDeps() {
    jest.resetAllMocks();

    const renderCommonTemplate = jest
      .spyOn(renderCommonTemplateMod, 'renderCommonTemplate')
      .mockImplementation();

    const renderFactoryTemplate = jest
      .spyOn(renderFactoryTemplateMod, 'renderFactoryTemplate')
      .mockImplementation();

    const renderIndexTemplate = jest
      .spyOn(renderIndexTemplateMod, 'renderIndexTemplate')
      .mockImplementation();

    return {
      renderCommonTemplate,
      renderFactoryTemplate,
      renderIndexTemplate,
    };
  }

  test('should assemble all files from Script ABI ', () => {
    const {
      typegen: { abis, outputDir },
    } = getNewAbiTypegen({
      category: CategoryEnum.SCRIPT,
      includeOptionType: false, // will prevent common template from being included
    });

    const { renderCommonTemplate, renderFactoryTemplate, renderIndexTemplate } = mockAllDeps();

    const files = assembleScripts({ abis, outputDir });

    expect(files.length).toEqual(3); // 2x factories, 1x index

    expect(renderCommonTemplate).toHaveBeenCalledTimes(0); // never called
    expect(renderFactoryTemplate).toHaveBeenCalledTimes(2);
    expect(renderIndexTemplate).toHaveBeenCalledTimes(1);
  });

  test('should assemble all files from Script ABI, including `common` file', () => {
    const {
      typegen: { abis, outputDir },
    } = getNewAbiTypegen({
      category: CategoryEnum.SCRIPT,
      includeOptionType: true, // will cause common template to be included
    });

    const { renderCommonTemplate, renderFactoryTemplate, renderIndexTemplate } = mockAllDeps();

    const files = assembleScripts({ abis, outputDir });

    expect(files.length).toEqual(4); // 2x factories, 1x index, 1x common

    expect(renderCommonTemplate).toHaveBeenCalledTimes(1); // called once
    expect(renderFactoryTemplate).toHaveBeenCalledTimes(2);
    expect(renderIndexTemplate).toHaveBeenCalledTimes(1);
  });
});
