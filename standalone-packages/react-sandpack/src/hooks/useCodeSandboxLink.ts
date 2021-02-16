import { getParameters } from 'codesandbox-import-utils/lib/api/define';
import { IFiles } from 'smooshpack';
import { useSandpack } from '../contexts/sandpack-context';

const getFileParameters = (files: IFiles) => {
  const normalized: {
    [path: string]: { content: string; isBinary: boolean };
  } = Object.keys(files).reduce(
    (prev, next) => ({
      ...prev,
      [next.replace('/', '')]: {
        content: files[next].code,
        isBinary: false,
      },
    }),
    {}
  );

  return getParameters({ files: normalized });
};

export const useCodeSandboxLink = () => {
  const { sandpack } = useSandpack();
  const params = getFileParameters(sandpack.files);

  return `https://codesandbox.io/api/v1/sandboxes/define?parameters=${params}&query=file=${sandpack.activePath}`;
};