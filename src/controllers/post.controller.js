const { withAuth } = require("../middleware/auth.middleware");
const {
  createPost,
  getPost,
  updatePost,
  deletePost,
  getUserPostsCount,
  getPostsByUserId,
} = require("../services/post.service");
const postController = require("express").Router();

postController.post("/create", withAuth, async (req, res) => {
  const { boardId, title, content, type } = req.body;
  const creator = req.userId;

  if (!title || !content) {
    return res
      .status(400)
      .json({ isError: true, message: "모든 필드를 입력해주세요." });
  }

  if (!boardId) {
    return res
      .status(400)
      .json({ isError: true, message: "등록된 게시판이 아닙니다." });
  }

  try {
    const post = await createPost({ creator, boardId, title, content, type });

    if (post.errorMsg !== null) {
      throw new Error(post.errorMsg);
    }

    return res
      .status(201)
      .json({ isError: false, message: "게시글이 등록되었습니다." });
  } catch (err) {
    console.error(`[post/create]: ${err}`);
    return res.status(500).json({ isError: true, message: `${err}` });
  }
});

postController.get("/detail/:postId", withAuth, async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return res
      .status(400)
      .json({ isError: true, message: "등록된 게시글이 없습니다." });
  }

  try {
    const postData = await getPost({ postId });

    if (postData.errorMsg !== null) {
      throw new Error(post.errorMsg);
    }

    return res.status(200).json({ post: postData.post });
  } catch (err) {
    console.error(`[post/detail]: ${err}`);
    return res.status(500).json({ isError: true, message: `${err}` });
  }
});

postController.post("/update/:postId", withAuth, async (req, res) => {
  const { title, content } = req.body;
  const { postId } = req.params;
  const creator = req.userId;
  if (!creator) {
    return res.status(401).json({
      isError: true,
      message: "로그인 유지시간이 만료되었습니다. 다시 로그인해주세요.",
    });
  }

  if (!title || !content) {
    return res
      .status(400)
      .json({ isError: true, message: "모든 필드를 입력해주세요." });
  }

  if (!postId) {
    return res
      .status(400)
      .json({ isError: true, message: "게시글 정보가 없습니다." });
  }

  try {
    const post = await updatePost({ postId, title, content });

    if (post.errorMsg !== null) {
      throw new Error(post.errorMsg);
    }

    return res
      .status(200)
      .json({ isError: false, message: "게시글이 수정되었습니다." });
  } catch (err) {
    console.error(`[post/update]: ${err}`);
    return res.status(500).json({ isError: true, message: `${err}` });
  }
});

postController.get("/delete/:postId", withAuth, async (req, res) => {
  const { postId } = req.params;
  const creator = req.userId;
  if (!creator) {
    return res.status(401).json({
      isError: true,
      message: "로그인 유지시간이 만료되었습니다. 다시 로그인해주세요.",
    });
  }

  if (!postId) {
    return res
      .status(400)
      .json({ isError: true, message: "게시글 정보가 없습니다." });
  }

  try {
    const postData = await deletePost({ postId });

    if (postData.errorMsg !== null) {
      throw new Error(post.errorMsg);
    }

    return res
      .status(200)
      .json({ isError: false, message: "게시글이 삭제되었습니다." });
  } catch (err) {
    console.error(`[post/delete]: ${err}`);
    return res.status(500).json({ isError: true, message: `${err}` });
  }
});

postController.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  try {
    const [posts, totalPostsCount] = await Promise.all([
      getPostsByUserId(userId, { limit, page }),
      getUserPostsCount(userId),
    ]);
    const totalPage = Math.ceil(totalPostsCount / limit);
    const nextPage = page + 1 > totalPage ? totalPage : page + 1;
    const prevPage = page - 1 === 0 ? page : page - 1;
    return res.status(200).json({
      isError: false,
      data: {
        posts,
        pageInfo: {
          currentPage: page,
          nextPage,
          prevPage,
          totalPage,
          totalPostsCount,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      isError: true,
      message: "게시글 정보를 가져오는데 실패했습니다.",
    });
  }
});

module.exports = postController;
