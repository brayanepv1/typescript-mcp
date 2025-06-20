import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { type Result, ok, err } from "neverthrow";
import { moveFile } from "../commands/move_file";
import {
  findProjectForFile,
  getOrCreateSourceFileWithRefresh,
} from "../project_cache";
import type { ToolDef } from "../../mcp/types";

const schemaShape = {
  root: z.string().describe("Root directory for resolving relative paths"),
  oldPath: z.string().describe("Current file path (relative to root)"),
  newPath: z.string().describe("New file path (relative to root)"),
  overwrite: z
    .boolean()
    .optional()
    .default(false)
    .describe("Overwrite the destination file if it exists"),
};

const schema = z.object(schemaShape);

export interface MoveFileResult {
  message: string;
  changedFiles: string[];
}

export async function handleMoveFile({
  root,
  oldPath,
  newPath,
  overwrite,
}: z.infer<typeof schema>): Promise<Result<MoveFileResult, string>> {
  // Always treat paths as relative to root
  const absoluteOldPath = path.join(root, oldPath);
  const absoluteNewPath = path.join(root, newPath);

  const project = findProjectForFile(absoluteOldPath);

  // Ensure the source file is loaded in the project with fresh content
  const sourceFileResult = (() => {
    try {
      getOrCreateSourceFileWithRefresh(absoluteOldPath);
      return ok(undefined);
    } catch {
      return err(`File not found: ${absoluteOldPath}`);
    }
  })();

  if (sourceFileResult.isErr()) {
    return err(sourceFileResult.error);
  }

  // Perform the move
  const result = moveFile(project, {
    oldFilename: absoluteOldPath,
    newFilename: absoluteNewPath,
    overwrite,
  });

  if (result.isErr()) {
    return err(result.error);
  }

  // Save all changes
  await project.save();

  return ok(result.value);
}

async function analyzeImportChanges(
  file: string,
  oldPath: string,
  newPath: string
): Promise<Result<string[], string>> {
  const contentResult = await fs
    .readFile(file, "utf-8")
    .then((content) => ok(content))
    .catch((error: unknown) =>
      err(error instanceof Error ? error.message : String(error))
    );

  if (contentResult.isErr()) {
    return ok([`    Import statements updated`]);
  }

  const lines = contentResult.value.split("\n");

  // Find lines with import statements that reference the moved file
  const importRegex = /(?:import|from|require)\s*\(?['"`]([^'"`]+)['"`]\)?/g;

  const importChanges = lines.flatMap((line, i) => {
    const lineNum = i + 1;
    const matches: string[] = [];
    let match;

    while ((match = importRegex.exec(line)) !== null) {
      const importPath = match[1];
      const fileDir = path.dirname(file);
      const resolvedNewPath = path.resolve(fileDir, importPath);
      const normalizedNewPath = path.normalize(newPath);

      if (
        resolvedNewPath === normalizedNewPath ||
        importPath.includes(path.basename(newPath, path.extname(newPath)))
      ) {
        const relativeOldPath = path
          .relative(fileDir, oldPath)
          .replace(/\\/g, "/");
        const oldLine = line.replace(
          importPath,
          relativeOldPath.startsWith(".")
            ? relativeOldPath
            : "./" + relativeOldPath
        );

        if (oldLine !== line) {
          matches.push(
            `    @@ -${String(lineNum)},1 +${String(lineNum)},1 @@`,
            `    - ${oldLine}`,
            `    + ${line}`
          );
        }
      }
    }
    return matches;
  });

  return ok(
    importChanges.length > 0 ? importChanges : [`    Import statements updated`]
  );
}

export async function formatMoveFileResult(
  result: MoveFileResult,
  oldPath: string,
  newPath: string,
  root: string
): Promise<Result<string, string>> {
  const { message, changedFiles } = result;

  const output = [
    `${message}. Updated imports in ${String(changedFiles.length)} file(s).`,
    "",
    "Changes:",
  ];

  // Extract the relative paths for import matching
  const oldRelativePath = path.relative(root, oldPath);
  const newRelativePath = path.relative(root, newPath);

  // Process each changed file
  const fileResults = await Promise.all(
    changedFiles.map(async (file) => {
      if (file === oldPath) {
        // This is the moved file itself
        return ok([`  File moved: ${oldRelativePath} → ${newRelativePath}`]);
      }

      const relativePath = path.relative(root, file);
      const importAnalysis = await analyzeImportChanges(file, oldPath, newPath);

      if (importAnalysis.isErr()) {
        return err(importAnalysis.error);
      }

      return ok([`  ${relativePath}:`, ...importAnalysis.value]);
    })
  );

  // Check if any file processing failed
  for (const fileResult of fileResults) {
    if (fileResult.isErr()) {
      return err(fileResult.error);
    }
    output.push(...fileResult.value);
  }

  return ok(output.join("\n"));
}

export const moveFileTool: ToolDef<typeof schema> = {
  name: "move_file",
  description:
    "Move a TypeScript/JavaScript file to a new location and update all import statements",
  schema,
  execute: async (args) => {
    const result = await handleMoveFile(args);
    if (result.isErr()) {
      throw new Error(result.error);
    }

    const absoluteOldPath = path.join(args.root, args.oldPath);
    const absoluteNewPath = path.join(args.root, args.newPath);
    const formattedResult = await formatMoveFileResult(
      result.value,
      absoluteOldPath,
      absoluteNewPath,
      args.root
    );

    if (formattedResult.isErr()) {
      throw new Error(formattedResult.error);
    }

    return formattedResult.value;
  },
};
