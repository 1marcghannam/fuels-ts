import { CategoryEnum } from '../types/enums/CategoryEnum';

export function validateBinFile(params: {
  abiFilepath: string;
  binFilepath: string;
  binExists: boolean;
  category: CategoryEnum;
}) {
  const { abiFilepath, binFilepath, binExists, category } = params;

  const isScript = !!~[CategoryEnum.SCRIPT].indexOf(category);

  if (!binExists && isScript) {
    throw new Error(
      [
        `Could not find [required] BIN file for — '${category}' ABI.`,
        `- ABI: ${abiFilepath}`,
        `- BIN: ${binFilepath}`,
        category,
      ].join('\n')
    );
  }
}
