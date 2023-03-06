import static com.google.gerrit.extensions.client.ListChangesOption.CURRENT_COMMIT;
import static com.google.gerrit.extensions.client.ListChangesOption.CURRENT_FILES;
import static com.google.gerrit.extensions.client.ListChangesOption.CURRENT_REVISION;
import com.google.common.collect.ImmutableList;
import com.google.gerrit.extensions.client.ListChangesOption;
import org.eclipse.jgit.revwalk.RevCommit;
    assertThat(cleanPatch(resultPatch)).isEqualTo(cleanPatch(originalPatch));
    assertThat(cleanPatch(resultPatch)).isEqualTo(cleanPatch(originalPatch));
    createBranchWithRevision(BranchNameKey.create(project, DESTINATION_BRANCH), head);
    PushOneCommit.Result destChange = createChange("refs/for/" + DESTINATION_BRANCH);
    PushOneCommit.Result baseCommit =
        createChange(testRepo, "branch", "Add file", ADDED_FILE_NAME, ADDED_FILE_CONTENT, "");
    assertThat(cleanPatch(resultPatch)).isEqualTo(cleanPatch(originalPatch));
    createBranchWithRevision(BranchNameKey.create(project, DESTINATION_BRANCH), head);
    PushOneCommit.Result destChange = createChange("refs/for/" + DESTINATION_BRANCH);
    PushOneCommit.Result baseCommit =
        createChange(testRepo, "branch", "Add file", ADDED_FILE_NAME, ADDED_FILE_CONTENT, "");
    assertThat(cleanPatch(resultPatch)).isEqualTo(cleanPatch(originalDecodedPatch));
  @Test
  public void applyPatchWithExplicitBase_OverrideParentId() throws Exception {
    PushOneCommit.Result inputParent = createChange("Input parent", "file1", "content");
    PushOneCommit.Result parent = createChange("Parent Change", "file2", "content");
    parent.assertOkStatus();
    PushOneCommit.Result dest = createChange("Destination Change", "file3", "content");
    ApplyPatchPatchSetInput in = buildInput(ADDED_FILE_DIFF);
    in.base = inputParent.getCommit().name();

    gApi.changes().id(dest.getChangeId()).applyPatch(in);

    ChangeInfo result = get(dest.getChangeId(), CURRENT_REVISION, CURRENT_COMMIT);
    assertThat(result.revisions.get(result.currentRevision).commit.parents.get(0).commit)
        .isEqualTo(inputParent.getCommit().name());

    BinaryResult resultPatch = gApi.changes().id(dest.getChangeId()).current().patch();
    assertThat(cleanPatch(resultPatch)).isEqualTo(ADDED_FILE_DIFF.trim());
  }

  @Test
  public void applyPatchWithNoExplicitBase_overwritesLatestPatch() throws Exception {
    PushOneCommit.Result dest = createChange("Destination Change", "ps1.txt", "ps1 content");
    RevCommit originalParentCommit = dest.getCommit().getParent(0);
    ApplyPatchPatchSetInput in = buildInput(ADDED_FILE_DIFF);

    gApi.changes().id(dest.getChangeId()).applyPatch(in);

    ChangeInfo result = get(dest.getChangeId(), CURRENT_REVISION, CURRENT_COMMIT, CURRENT_FILES);
    assertThat(result.revisions.get(result.currentRevision).commit.parents.get(0).commit)
        .isEqualTo(originalParentCommit.name());
    assertThat(result.revisions.get(result.currentRevision).files.keySet())
        .containsExactly(ADDED_FILE_NAME);
    assertDiffForNewFile(
        fetchDiffForFile(result, ADDED_FILE_NAME),
        result.currentRevision,
        ADDED_FILE_NAME,
        ADDED_FILE_CONTENT);
  }

    input.responseFormatOptions = ImmutableList.of(ListChangesOption.CURRENT_REVISION);
  private String cleanPatch(BinaryResult bin) throws IOException {
    return cleanPatch(bin.asString());
  private String cleanPatch(String s) {
    return s
        // Remove the header
        .substring(s.lastIndexOf("\ndiff --git"), s.length() - 1)
        // Remove "index NN..NN lines
        .replaceAll("(?m)^index.*", "")
        // Remove empty lines
        .replaceAll("\n+", "\n")
        // Trim
        .trim();