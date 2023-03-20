import static com.google.gerrit.server.patch.DiffUtil.cleanPatch;
  public void applyPatchWithExplicitBase_overrideParentId() throws Exception {
  @Test
  public void commitMessage_providedMessage() throws Exception {
    final String msg = "custom message";
    initDestBranch();
    ApplyPatchPatchSetInput in = buildInput(ADDED_FILE_DIFF);
    in.commitMessage = msg;

    ChangeInfo result = applyPatch(in);

    ChangeInfo info = get(result.changeId, CURRENT_REVISION, CURRENT_COMMIT);
    assertThat(info.revisions.get(info.currentRevision).commit.message)
        .isEqualTo(msg + "\n\nChange-Id: " + result.changeId + "\n");
  }

  @Test
  public void commitMessage_defaultMessageAndPatchHeader() throws Exception {
    initDestBranch();
    ApplyPatchPatchSetInput in = buildInput("Patch header\n" + ADDED_FILE_DIFF);

    ChangeInfo result = applyPatch(in);

    ChangeInfo info = get(result.changeId, CURRENT_REVISION, CURRENT_COMMIT);
    assertThat(info.revisions.get(info.currentRevision).commit.message)
        .isEqualTo("Default commit message\n\nChange-Id: " + result.changeId + "\n");
  }

  @Test
  public void commitMessage_defaultMessageAndNoPatchHeader() throws Exception {
    initDestBranch();
    ApplyPatchPatchSetInput in = buildInput(ADDED_FILE_DIFF);

    ChangeInfo result = applyPatch(in);

    ChangeInfo info = get(result.changeId, CURRENT_REVISION, CURRENT_COMMIT);
    assertThat(info.revisions.get(info.currentRevision).commit.message)
        .isEqualTo("Default commit message\n\nChange-Id: " + result.changeId + "\n");
  }

        .create(new ChangeInput(project.get(), DESTINATION_BRANCH, "Default commit message"))