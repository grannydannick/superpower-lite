import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, resample, sparse, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { existsSync, renameSync } from 'node:fs';

interface OptimizeGlbArgs {
  inputPath: string;
  outputPath: string;
  shouldKeepAttribute: (name: string) => boolean;
}

const optimizeGlb = async ({ inputPath, outputPath, shouldKeepAttribute }: OptimizeGlbArgs) => {
  if (!existsSync(inputPath)) {
    throw new Error(`Input GLB not found: ${inputPath}`);
  }

  await MeshoptDecoder.ready;
  await MeshoptEncoder.ready;

  const io = new NodeIO()
    .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder,
    });

  const doc = await io.read(inputPath);

  const root = doc.getRoot();
  for (const mesh of root.listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      for (const semantic of primitive.listSemantics()) {
        if (shouldKeepAttribute(semantic)) continue;
        primitive.setAttribute(semantic, null);
      }
    }
  }

  await doc.transform(
    dedup(),
    weld(),
    resample(),
    prune({ keepAttributes: true, keepIndices: true }),
    sparse(),
    meshopt({ encoder: MeshoptEncoder, level: 'high' }),
  );

  const tmpPath = `${outputPath}.tmp.glb`;
  await io.write(tmpPath, doc);
  renameSync(tmpPath, outputPath);
};

const main = async () => {
  const shouldKeepAttribute = (name: string) => {
    if (name === 'POSITION') return true;
    if (name === 'NORMAL') return true;
    if (name.startsWith('TEXCOORD_')) return true;
    if (name === 'JOINTS_0') return true;
    if (name === 'WEIGHTS_0') return true;
    return false;
  };

  const targets: { inputPath: string; outputPath: string }[] = [
    {
      inputPath: 'public/models/female/femaleOptimisedV8.glb',
      outputPath: 'public/models/female/femaleOptimisedV8.glb',
    },
    {
      inputPath: 'public/models/male/maleOptimisedV8.glb',
      outputPath: 'public/models/male/maleOptimisedV8.glb',
    },
  ];

  for (const t of targets) {
    // eslint-disable-next-line no-console
    console.log(`Optimizing ${t.inputPath}…`);
    await optimizeGlb({
      inputPath: t.inputPath,
      outputPath: t.outputPath,
      shouldKeepAttribute,
    });
    // eslint-disable-next-line no-console
    console.log(`Wrote ${t.outputPath}`);
  }
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

